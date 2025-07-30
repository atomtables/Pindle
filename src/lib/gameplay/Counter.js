export function Counter(object, delim = "") {
    if (!(this instanceof Counter)) {
        throw new Error("Counter must be called with 'new'");
    }

    const count = object.split(delim);
    this.result = {};

    for (const char of count) {
        this.result[char] = (this.result[char] || 0) + 1;
    }
}

Counter.prototype[Symbol.iterator] = function* () {
    for (const key in this.result) {
        yield [key, this.result[key]];
    }
};
