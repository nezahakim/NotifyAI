require('dotenv').config();

module.exports = {
    URL: "https://nezaai.vercel.app",
    // Bot token from BotFather
    BOT_TOKEN: process.env.BOT_TOKEN,
    BOT_TOKEN_TWO: process.env.BOT_TOKEN_TWO,

    // Hugging Face API token
    HF_TOKEN: process.env.HF_TOKEN,

    // Model configurations
    TEXT_MODEL: "meta-llama/Meta-Llama-3-8B-Instruct",
    MATH_MODEL: "meta-llama/Meta-Llama-3-8B-Instruct",
    // CODE_MODEL: "OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5",
    CODE_MODEL: "meta-llama/Meta-Llama-3-8B-Instruct",

    VOICE_RECG: "openai/whisper-large-v3",
    SUMMARY_MODEL: "facebook/bart-large-cnn",

    IMAGE_MODEL: "mann-e/Mann-E_Dreams",
    IMAGE_MODEL_SCHNELL: "black-forest-labs/FLUX.1-schnell",
    IMAGE_MODEL_DEV: "black-forest-labs/FLUX.1-dev",

    IMAGE_VARIATION_MODEL: "lambdalabs/sd-image-variations-diffusers",

    // Generation parameters
    MAX_TOKENS: 265,
    TEMPERATURE: 0.8,
    TOP_P: 0.9,

    // Rate limiting
    MESSAGE_DELAY: 500,

    // Telegram API configurations
    API_BASE_URL: "https://api.telegram.org",

    // Command prefixes
    GENERATE_COMMAND: "/generate",
    START_COMMAND: "/start",

    // Response messages
    WELCOME_MESSAGE: "Welcome to NezaAI! How can I assist you today?",
    THINKING_MESSAGE: "Thinking...👀",
    ERROR_MESSAGE: " Maybe Yeah!",

    // Chunk sizes for live responses
    LIVE_RESPONSE_CHUNK_SIZE: 20,
    CHANNEL_RESPONSE_CHUNK_SIZE: 100,
};
