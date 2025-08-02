export default {
    name: "Pindle",
    version: "1.0.0",
    length: {
        easy: 4,
        medium: 6,
        hard: 8,
        impossible: [4, 15] // min, max
    },
    reachedLimit(diff: number, length: number): boolean {
        return diff === 0 && this.length.easy <= length ||
            diff === 1 && this.length.medium <= length ||
            diff === 2 && this.length.hard <= length ||
            diff === 3 && length > this.length.impossible[1];
    },
    attemptTimeout: (length: number): number => (150 * length) + 400,
    difficulty: {
        0: "easy",
        1: "medium",
        2: "hard",
        3: "impossible"
    },
    difficultyId: {
        easy: 0,
        medium: 1,
        hard: 2,
        impossible: 3
    },
    gamemode: {
        0: "normal",
        1: "trycount",
        2: "minute"
    },
    trycount: 10, // tries
    minute: 1 // minute
}