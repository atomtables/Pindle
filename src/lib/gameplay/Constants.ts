export default {
    name: "Pindle",
    version: "1.0.0",
    length: {
        0: 4,
        1: 6,
        2: 8,
        3: [4, 15] // min, max
    },
    reachedLimit(diff: number, length: number): boolean {
        return diff === 3 ? this.length.impossible[1] <= length : this.length[diff] <= length;
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
    gamemodeId: {
        normal: 0,
        trycount: 1,
        minute: 2
    },
    trycount: {
        0: 10,
        1: 12,
        2: 15,
        3: 18
    }, // tries
    minute: 1 // minute
}