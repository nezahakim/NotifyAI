const searchService = require('../services/searchService');
const weatherService = require('../services/weatherService');
const { getNewsUpdate, SendNewsUpdates } = require('../services/newsService');
const { tutorial, TutorialProcess } = require('../services/tutorialService');

const middleWare =  require('../middleware/middleware')
const ImagineCheck = require('../middleware/ImagineCheck')
const imagineCommand =  require('./imagineCommand')
const NodeCache = require('node-cache');

// Cache for tutorial state
const tutorialCache = new NodeCache({ stdTTL: 3600 });

const commands = (bot) => {
    // Start Command
    bot.command('start', async (ctx) => {
        const userId = ctx.from.id;
        if (!tutorialCache.get(`tutorial_${userId}`)) {
            tutorialCache.set(`tutorial_${userId}`, true);
            return tutorial(bot, ctx.message);
        }
        return ctx.reply(`Welcome to NezaAI! 🤖\n\nAvailable commands:\n/imagine - Generate AI images\n/weather - Check weather\n/search - Search information\n/news - Get latest news\n/tutorial - Start tutorial`);
    });

    // Tutorial Command
    bot.command('tutorial', (ctx) => {
        const userId = ctx.from.id;
        tutorialCache.set(`tutorial_${userId}`, true);
        return tutorial(bot, ctx.message);
    });

    // Imagine Command
    bot.command('imagine', ImagineCheck, imagineCommand)

    // bot.command('imagine', async (ctx) => {
    //     const prompt = ctx.message.text.split('/imagine ')[1];
    //     if (!prompt) {
    //         return ctx.reply('Please provide a description for the image. Example: /imagine sunset over mountains');
    //     }

    //     const processingMsg = await ctx.reply('🎨 Generating your image...');
    //     try {
    //         const imageCount = ctx.chat.type === 'private' ? 3 : 2;
    //         const images = await ImageModel.generateMultipleImages(prompt, imageCount);
            
    //         if (images && images.length > 0) {
    //             await ctx.telegram.sendMediaGroup(ctx.chat.id, 
    //                 images.map(image => ({
    //                     type: 'photo',
    //                     media: { source: image }
    //                 }))
    //             );
    //         } else {
    //             await ctx.reply('Failed to generate images. Please try again.');
    //         }
    //     } catch (error) {
    //         await ctx.reply('Error generating images. Please try again later.');
    //     } finally {
    //         await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);
    //     }
    // });

    // Weather Command
    bot.command('weather', async (ctx) => {
        const city = ctx.message.text.split('/weather ')[1];
        if (!city) {
            return ctx.reply('Please provide a city name. Example: /weather London');
        }
        await weatherService(bot, ctx.chat.id, city);
    });

    // Search Command
    bot.command('search', middleWare, async (ctx) => {
        const query = ctx.message.text.split('/search ')[1];
        if (!query) {
            return ctx.reply('Please provide a search query. Example: /search artificial intelligence');
        }
        await searchService(bot, ctx.chat.id, query);
    });

    // News Command
    bot.command('news', middleWare,async (ctx) => {
        try {
            const newsData = await getNewsUpdate();
            await SendNewsUpdates(newsData, ctx.chat.id, bot);
        } catch (error) {
            await ctx.reply('Error fetching news. Please try again later.');
        }
    });

    // Handle tutorial progress
    bot.on('message', (ctx) => {
        const userId = ctx.from.id;
        if (tutorialCache.get(`tutorial_${userId}`)) {
            TutorialProcess(bot, ctx.message);
        }
    });

};

module.exports = commands;
