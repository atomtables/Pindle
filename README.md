# Pindle

What is Pindle? What isn't it?

Pindle is a cool game where you are given clues to guess a PIN. 
The game is similar to Breaklock, a fun game that has a similar system except
for the fact that it has you guess a pattern.

## How to play
You enter a PIN, and the game will tell you how many you got right. More details
are in the instructions found in the actual game.

## How to host
You can host the basic game just through svelte SSG.
```bash
pnpm install
pnpm run build
```
Host the contents of the build directory on a web server.

There's also a server to host the game with a leaderboard. This is
a bogstandard Node.js server.
```bash
cd database
pnpm install
npx tsx index.js
```

## Why did I make this?
I like Wordle, and I like Breaklock. I also have no original ideas, but I thought the concept
of a PIN guessing game would be fun. Especially if I could replicate every aspect of the
Android lock screen while doing it. It looks really good and I would even say it looks
better than Android (except for some sluggishness on Low Battery mode or the bad
animations because of web browser limitations.)

## Try it out: https://pindle.atomtables.dev
