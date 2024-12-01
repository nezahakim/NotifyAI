const axios = require("axios");
const {HfInference} = require("@huggingface/inference");
const config = require("../AI/config");

const hf = new HfInference(process.env.HF_TOKEN_1);

const searchService = async (bot, chatId, query) => {
  try {
    const response = await axios.get(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&utf8=`,
    );

    const results = response.data.query.search.slice(0, 5);
    if (results.length === 0) {
      await bot.sendMessage(
        chatId,
        `📚 I couldn't find any information on that. Could you try rephrasing your query or asking about something else?`,
      );
      return;
    }

    let messageText = `📚 Here's what I've discovered:\n\n`;

    for (const [index, result] of results.entries()) {
      const cleanedSnippet = cleanSnippet(result.snippet);
      const summary = await summarizeContent(cleanedSnippet);
      const emoji = getRandomEmoji();
      messageText += `${emoji} *${result.title}*\n${summary}\n\n`;
    }

    messageText += `🔍 *Want to explore further?* Check out these Wikipedia pages:\n`;
    results.forEach((result, index) => {
      const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/ /g, "_"))}`;
      messageText += `${index + 1}. [${result.title}](${url})\n`;
    });

    messageText += `\n💡 *Pro tip:* Try asking follow-up questions about any of these topics!`;

    await bot.sendMessage(chatId, messageText, {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });
  } catch (error) {
    console.error("Error performing search:", error);
    await bot.sendMessage(
      chatId,
      "🤖 Oops! My circuits got a bit tangled. Could you try asking again in a moment?",
    );
  }
};

const summarizeContent = async (content) => {
  try {
    const summaryResponse = await hf.summarization({
      model: config.SUMMARY_MODEL,
      inputs: content,
      parameters: {
        max_length: 150,
        min_length: 50,
        do_sample: false,
      },
    });

    if (summaryResponse && summaryResponse.summary_text) {
      return summaryResponse.summary_text;
    } else {
      throw new Error("Invalid inference output");
    }
  } catch (error) {
    console.error("Error summarizing content:", error);
    return content.slice(0, 150) + "...";
  }
};

const getRandomEmoji = () => {
  const emojis = ["🌟", "💡", "🔍", "📚", "🧠", "🌈", "🌞", "🌺", "🍀", "🦋"];
  return emojis[Math.floor(Math.random() * emojis.length)];
};

const cleanSnippet = (snippet) => {
  // Remove HTML tags
  let cleaned = snippet.replace(/<\/?[^>]+(>|$)/g, "");
  // Replace HTML entities
  cleaned = cleaned.replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  return cleaned;
};

module.exports = searchService;