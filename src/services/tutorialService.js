const tutorialSteps = [
    {
        message:
            "Welcome to the NezaAI tutorial! Let's start with image generation. Type '/imagine a futuristic city' to create your first AI image.",
        expectedCommand: "/imagine",
        response:
            "Great job! You've created your first AI-generated image. Let's try something else.",
    },
    {
        message:
            "Now, let's check the weather. Type '/weather' followed by your city name.",
        expectedCommand: "/weather",
        response:
            "Excellent! You now know how to check weather updates. Moving on to the next feature.",
    },
    {
        message:
            "Let's explore the web with AI. Type '/search latest AI trends' to see how it works.",
        expectedCommand: "/search",
        response:
            "Perfect! You've mastered the search feature. Let's check out your rewards next.",
    },
    {
        message:
            "Let's explore the web with AI. Type '/search latest AI trends' to see how it works.",
        expectedCommand: "/news",
        response:
            "Perfect! You've mastered the search feature. Let's check out your rewards next.",
    },
];

module.exports = userTutorialProgress = new Map();

module.exports = tutorial = (bot, msg) => {
    try {
        const telegramId = msg.from.id.toString();
        userTutorialProgress.set(telegramId, 0);
        bot.sendMessage(telegramId, tutorialSteps[0].message);
    } catch (error) {
        console.error("Error sending tutorial message:", error);
    }
};

module.exports = TutorialProcess = async (bot, msg) => {
    const telegramId = msg.from.id.toString();
    const progress = userTutorialProgress.get(telegramId);

    if (progress !== undefined) {
        const currentStep = tutorialSteps[progress];
        if (msg.text.startsWith(currentStep.expectedCommand)) {
            bot.sendMessage(telegramId, currentStep.response);

            if (progress < tutorialSteps.length - 1) {
                userTutorialProgress.set(telegramId, progress + 1);
                bot.sendMessage(
                    telegramId,
                    tutorialSteps[progress + 1].message,
                );
            } else {
                userTutorialProgress.delete(telegramId);
                const user = await User.findOne({ telegramId });
                user.points += 50; // Reward for completing tutorial
                await user.save();
                bot.sendMessage(
                    telegramId,
                    "Tutorial completed! You've earned 50 points. Enjoy using NezaAI!",
                );
            }
        }
    }
};