const { Telegraf } = require('telegraf')
const messageHandler = require('./handlers/messageHandler')
const commands = require('./commands/index')
const middleWare =  require('../middleware/middleware')
require('dotenv').config()

// const { HttpsProxyAgent } = require('https-proxy-agent');
// const proxyAgent = new HttpsProxyAgent('http://192.168.4.2:8080');
// const bot =  new Telegraf(process.env.BOT_TOKEN,{
//     telegram: {
//         agent: proxyAgent
//       }
// })

const bot =  new Telegraf(process.env.BOT_TOKEN)


commands(bot)
// bot.command('start', startCommand)
// bot.command('help',middleWare, helpCommand)
// bot.command('imagine',ImagineCheck, imagineCommand)

// Handle private messages
bot.on('text', middleWare, (ctx) => {
  if (ctx.chat.type === 'private') {
      return messageHandler(ctx);
  }
});

// Handle group messages with mention or reply
bot.on('text', (ctx) => {
  if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
      const isMentioned = ctx.message.text.includes(ctx.botInfo.username);
      const isReply = ctx.message.reply_to_message?.from?.id === ctx.botInfo.id;
      
      if (isMentioned || isReply) {
          return messageHandler(ctx);
      }
  }
});


// bot.on('callback_query', inlineKeyboardHandler);
module.exports = bot;