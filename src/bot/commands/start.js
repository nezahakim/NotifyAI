
module.exports = async (ctx) => {
    const update = ctx.update

    const chat = update.message.chat

    console.log(chat)
    ctx.reply("Hello, there welcome Here!!");
};
