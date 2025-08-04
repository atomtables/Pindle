// @ts-ignore
import Constants from "./Constants.ts";

export function RNG(diff: number) {
    if (!(this instanceof RNG)) {
        throw new Error("RNG must be called with 'new'");
    }

    this.diff = diff || 0;
    this.rand = (a: number, b: number) => {
        return a+(b-a+1)*crypto.getRandomValues(new Uint32Array(1))[0]/2**32|0
    }
}

RNG.prototype.get = function (): string {
    let num: string = "";
    if (this.diff !== 3 && 0 <= this.diff && this.diff <= 2) {
        for (let i = 0; i < Constants.length[this.diff]; i++) {
            num += this.rand(0, 9).toString();
        }
    } else if (this.diff === 3) {
        for (let i = 0; i < this.rand(Constants.length[this.diff][0], Constants.length[this.diff][1]); i++) {
            num += this.rand(0, 9).toString();
        }
    }
    return num
}