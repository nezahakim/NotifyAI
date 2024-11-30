const woGen = require('../../AI/woGen');

module.exports = async (ctx) => {
    const replyToMessageId = ctx.message.reply_to_message?.message_id;
    let sentMessage = null;
    let fullResponse = "";
    let typingInterval;

    const updateMessage = async (content) => {
        if (!content.trim()) return;

        try {
            if (!sentMessage) {
                sentMessage = await ctx.reply(content.trim(), {
                    reply_to_message_id: replyToMessageId,
                    parse_mode: "Markdown"
                });
            } else {
                await ctx.telegram.editMessageText(
                    ctx.chat.id,
                    sentMessage.message_id,
                    null,
                    content.trim(),
                    { parse_mode: "Markdown" }
                );
            }
        } catch (error) {
            console.error("Update error:", error.message);
        }
    };

    try {
        typingInterval = setInterval(
            () => ctx.telegram.sendChatAction(ctx.chat.id, "typing"),
            2500
        );

        for await (const chunk of woGen.generateText(
            ctx.from.id,
            ctx.message.text,
            ctx.chat.type
        )) {
            fullResponse += chunk;
            await updateMessage(fullResponse);
        }
    } finally {
        clearInterval(typingInterval);
    }
};
