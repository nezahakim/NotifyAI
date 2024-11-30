const woGen = require('../services/woGen'); // Adjust path as needed
const config = require('../config'); // Adjust path as needed

module.exports = async (ctx) => {
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;
    const userMessage = ctx.message.text || "";
    let messageId = null;
    let fullResponse = "";
    const updateInterval = 500;
    let lastUpdateTime = 0;
    let typingInterval;
    let currentText;
    let fullContext = "";

    const updateMessage = async (content, force = false) => {
        const currentTime = Date.now();
        
        if (force || currentTime - lastUpdateTime >= updateInterval) {
            if (content.trim()) {
                try {
                    if (!messageId) {
                        const sentMessage = await ctx.reply(content.trim(), {
                            reply_to_message_id: ctx.message.message_id,
                            parse_mode: "Markdown",
                        });
                        messageId = sentMessage.message_id;
                        currentText = sentMessage.text;
                    } else {
                        if (currentText !== fullContext) {
                            await ctx.telegram.editMessageText(
                                chatId,
                                messageId,
                                null,
                                content.trim(),
                                { parse_mode: "Markdown" }
                            );
                            fullContext += currentText;
                        } else {
                            console.log("No changes detected. Message content is the same.");
                        }
                    }
                    lastUpdateTime = currentTime;
                } catch (error) {
                    console.error("Error updating message:", error);
                }
            }
        }
    };

    try {
        typingInterval = setInterval(
            () => ctx.telegram.sendChatAction(chatId, "typing"),
            2500
        );

        for await (const chunk of woGen.generateText(
            userId,
            userMessage,
            ctx.state.action_type // You can set this in middleware or pass it as needed
        )) {
            fullResponse += chunk;
            await updateMessage(fullResponse);
        }

        // Final update
        await updateMessage(fullResponse, true);
    } catch (error) {
        console.error("Error in generateLiveResponse:", error);
        await ctx.reply(config.ERROR_MESSAGE);
    } finally {
        clearInterval(typingInterval);
    }
};
