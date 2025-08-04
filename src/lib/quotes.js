export const Success = () => {
    return successQuotes[Math.floor(Math.random() * successQuotes.length)];
}
export const successQuotes = [
    "Success seems to come easy to you. It's time you had a challenge.",
    "Winning is nothing if it didn't give you a challenge.",
    "The fun isn't in the green. The fun is falling short of it.",
    "Do you believe you can fly? You can't. At least you won. That's something.",
    "You won! But you didn't win the game. You just won the round.",
    "You just destroyed a guy named Edward. He was a nice guy. Was it really worth it?",
    "I made a game. You just wasted a couple minutes of your life on it. Who's the real winner?"
]

export const Failure = () => {
    return failureQuotes[Math.floor(Math.random() * failureQuotes.length)];
}
export const failureQuotes = [
    "I mean, at least you didn't quit. That's something.",
    "\"You failed\" - Sun Tzu, The Art of War",
    "If failure is the first step to success, you must have started living there.",
    "You failed. But you know what? You tried. Still failed though.",
    "Motivation might have been nice. In other news, spoon was found in kitchen.",
    "\"Don't stop, make it pop, DJ, blow my speakers up.\" - Sonic the Hedgehog, 2006",
]

export const Quit = () => {
    return quitQuotes[Math.floor(Math.random() * quitQuotes.length)];
}
export const quitQuotes = [
    "Quitting is arguably the worst move you could have made in this game.",
    "You did this to yourself. Why? What's the point?",
    "Close this tab. Never open it again. You don't deserve to play this game.",
]