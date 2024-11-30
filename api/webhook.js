const bot = require('../src/bot/bot')

// Webhook handler
module.exports = async (request, response) => {
    try {
        const { body } = request;
        if (body.message || body.callback_query) {
            await bot.handleUpdate(body);
        }
        response.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error('Webhook error:', error);
        response.status(500).json({ error: 'Failed to process update' });
    }
};
