import {Counter} from "./Counter.js";

export function AccuracyCalculation(input, answer) {
    let beads = [];
    let counter = new Counter(input);
    let inputs = counter.result;
    let answerdup = answer.split('');
    // get exact places
    for (let i = 0; i < input.length; i++) {
        if (input[i] === answer?.[i]) {
            beads.push(2);
            inputs[input[i]]--;
            answerdup[i] = null;
        }
    }
    for (let [k, v] of counter) {
        for (let j = 0; j < v; j++) {
            if (answerdup.includes(k)) {
                answerdup[answerdup.indexOf(k)] = null;
                beads.push(1);
            } else {
                beads.push(0);
            }
        }
    }
    return beads
}