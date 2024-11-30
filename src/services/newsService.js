const NodeCache = require('node-cache');
const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config()

// Initialize node-cache
const cache = new NodeCache({ stdTTL: 86400 }); // Cache for 24 hours

// Initialize RSS parser
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['media:thumbnail', 'thumbnail'],
    ],
  },
});


const newsSources = [
  { name: 'BBC', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', type: 'rss' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', type: 'rss' },
  { name: 'CNN', url: 'http://rss.cnn.com/rss/edition_world.rss', type: 'rss' },
  { name: 'Reuters', url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best', type: 'rss' }
];

let currentSourceIndex = 0;

// Function to fetch news
async function fetchNews(source) {
  try {
    if (source.type === 'rss') {
      return await fetchRssNews(source);
    } else {
      return;
    }
  } catch (error) {
    console.error(`Error fetching news from ${source.name}:`, error);
    throw error;
  }
}

// Function to fetch RSS news
async function fetchRssNews(source) {
  try {
    const feed = await parser.parseURL(source.url);
    const latestItem = feed.items[0];
    
    let mediaUrl = null;
    let mediaType = null;

    if (latestItem.media) {
      mediaUrl = latestItem.media.$ ? latestItem.media.$.url : null;
      mediaType = latestItem.media.$ ? (latestItem.media.$.medium === 'image' ? 'photo' : 'video') : null;
    } else if (latestItem.thumbnail) {
      mediaUrl = latestItem.thumbnail.$ ? latestItem.thumbnail.$.url : null;
      mediaType = 'photo';
    }

    const fullContent = await getFullArticle(latestItem.link);

    return {
      title: latestItem.title,
      summary: latestItem.contentSnippet || latestItem.content || "",
      fullContent: fullContent,
      mediaUrl: mediaUrl,
      mediaType: mediaType,
      fullArticleUrl: latestItem.link,
      source: source.name
    };
  } catch (error) {
    console.error(`Error fetching RSS from ${source.name}:`, error);
    throw error;
  }
}

async function getFullArticle(url) {
  try {
    console.log(`Fetching full article from: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000 // 10 seconds timeout
    });
    const $ = cheerio.load(response.data);
    
    // Try different selectors to find the main content
    let articleText = $('article').text().trim();
    if (articleText.length < 300) {
      articleText = $('.article-body').text().trim();
    }
    if (articleText.length < 300) {
      articleText = $('main').text().trim();
    }
    if (articleText.length < 300) {
      articleText = $('body').text().trim();
    }
    
    console.log(`Article text length: ${articleText.length}`);
    return articleText.length > 300 ? articleText : 'Unable to extract a meaningful article text.';
  } catch (error) {
    console.error('Error fetching full article:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    throw error;
  }
}

module.exports = async function SendNewsUpdates(newsData, chatId, bot) {
  try {
    const caption = `📰 *${newsData.title}*\n\n• ${newsData.fullContent.split('.')[0]}.\n\n[Notifycast+](http://t.me/Notifycast)  |  [${newsData.source}](${newsData.fullArticleUrl})`;

    const inlineKeyboard = {
      inline_keyboard: [[
        { text: 'Read Full News', url: "https://t.me/Notifycast" }
      ]]
    };

    if (newsData.mediaType === 'photo' && newsData.mediaUrl) {
      await bot.sendPhoto(chatId, newsData.mediaUrl, {
        caption: caption,
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard
      });
    } else if (newsData.mediaType === 'video' && newsData.mediaUrl) {
      await bot.sendVideo(chatId, newsData.mediaUrl, {
        caption: caption,
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard
      });
    } else {
      // If no media, send as a text message
      await bot.sendMessage(chatId, `${caption}\n\nFull article: [${newsData.source}](${newsData.fullArticleUrl})`, {
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard
      });
    }

    console.log(`Posted news from ${newsData.source}`);
  } catch (error) {
    console.error('Error posting news to channel:', error);
    throw error;
  }
}



module.exports =  async function getNewsUpdate(){
  const currentSource = newsSources[currentSourceIndex];
  try {
    let fullArticle = cache.get("NewsUpdate");
    if(fullArticle){
      return fullArticle
    }else{
      const newsData = await fetchNews(currentSource);
      cache.set("NewsUpdate", newsData);

      return newsData;
    }
  } catch (error) {
    console.error(`Error in scheduled job for ${currentSource.name}:`, error);
  } finally {
    currentSourceIndex = (currentSourceIndex + 1) % newsSources.length;
  }
}