
module.exports = async (ctx) => {
    const update = ctx.update

    const chat = update.message.chat

    console.log(chat)
    ctx.reply("Welcome to our Help section!\n1. /start for starting.\n2. /new for news.");
};
