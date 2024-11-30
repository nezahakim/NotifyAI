const ImageModel = require('../../AI/viGen');

module.exports = async (ctx) => {
    const prompt = ctx.message.text.split('/imagine ')[1];
    
    if (!prompt) {
        return ctx.reply('Please provide a description for the image generation.');
    }

    try {
        // Get number of images based on chat type
        const imageCount = ctx.chat.type === 'private' ? 3 : 2;
        
        // Show processing message
        const processingMsg = await ctx.reply('🎨 Generating your images...');
        
        // Generate multiple images
        const images = await ImageModel.generateMultipleImages(prompt, imageCount);
        
        if (!images || images.length === 0) {
            return ctx.reply('Failed to generate images. Please try again.');
        }

        // Send images as media group
        await ctx.telegram.sendMediaGroup(ctx.chat.id, 
            images.map(image => ({
                type: 'photo',
                media: { source: image }
            }))
        );

        // Update user stats
        ctx.userStats.imageCount += 1;
        userCache.set(`user_${ctx.from.id}`, ctx.userStats);

        // Delete processing message
        await ctx.telegram.deleteMessage(ctx.chat.id, processingMsg.message_id);

    } catch (error) {
        console.error('Image generation error:', error);
        return ctx.reply('An error occurred while generating images. Please try again.');
    }
};
