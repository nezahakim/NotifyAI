const NodeCache = require('node-cache');
const userCache = new NodeCache({ stdTTL: 86400 }); // 24 hour TTL

module.exports = async (ctx, next) => {
    const user = ctx.from;
    const channel = "@Notifycode";
    const dailyTries = ctx.chat.type === 'private' ? 6 : 3;
    
    // Get user stats from cache
    let userStats = userCache.get(`user_${user.id}`) || {
        imageCount: 0,
        lastReset: Date.now()
    };

    // Reset counter if 24 hours passed
    if (Date.now() - userStats.lastReset >= 86400000) {
        userStats = {
            imageCount: 0,
            lastReset: Date.now()
        };
    }

    try {
        const member = await ctx.telegram.getChatMember(channel, user.id);
        const isSubscribed = ["member", "administrator", "creator"].includes(member.status);
        
        // Check image generation limits
        const maxImages = isSubscribed ? dailyTries + 3 : dailyTries;
        
        if (userStats.imageCount >= maxImages) {
            if (!isSubscribed) {
                return ctx.reply('You\'ve reached your daily limit! Join our channel for 3 extra generations: ' + channel);
            }
            return ctx.reply('You\'ve reached your maximum daily generations. Try again tomorrow!');
        }

        // Update context with user stats for the image generator
        ctx.userStats = userStats;
        ctx.isSubscribed = isSubscribed;
        
        return next();
    } catch (error) {
        console.log('Subscription check error:', error);
        return ctx.reply('Unable to verify channel membership. Please try again later.');
    }
};
