export default {
    name: "Pindle",
    version: "1.0.0",
    length: {
        0: 4,
        1: 6,
        2: 8,
        3: [4, 12] // min, max
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
    minute: {
        0: 60,
        1: 60,
        2: 60,
        3: 60
    },
    // when comparing two equivalent attempts, compare with time and vice versa. this states how to compare attempts
    conversion: {
        attempt: 10, // 1 attempt is 10 seconds
        time: 0.2, // 5 seconds is 1 attempt,
        get(attempt: number, time: number) {
            if (!attempt || !time) return Infinity;
            return attempt * this.attempt + time * this.time;
        }
    }
}