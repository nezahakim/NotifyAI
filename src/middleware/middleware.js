require("dotenv").config()

module.exports = async (ctx, next) => {

    const user = ctx.from;
    const channel = "@Notifycode";

    try {
        const member = await ctx.telegram.getChatMember(channel, user.id);
        if (["member", "administrator", "creator"].includes(member.status)) {
            return next();
        } else {
            return ctx.reply('Hi, there!\nIt\'s better if you Join the official channel to get started.');
        }
    } catch (error) {
        console.log('Membership check error:', error);
        return ctx.reply('Unable to verify channel membership. Please try again later.');
    }
};
