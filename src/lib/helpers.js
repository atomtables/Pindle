export function formatTime(secondsRemaining) {
    let ss = Math.floor(secondsRemaining) % 60;
    let mm = Math.floor(secondsRemaining / 60) % 60;
    return `${mm}:${ss < 10 ? '0' + ss : ss}`;
}