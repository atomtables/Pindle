// noinspection ES6PreferShortImport

import express from 'express';
import process from "node:process";
import cron from 'node-cron';
import "dotenv/config";
import { drizzle } from 'drizzle-orm/libsql';
import { leaderboard } from './schema.ts';

import { RNG } from "../src/lib/gameplay/RNG.ts";
import { AccuracyCalculation } from "../src/lib/gameplay/AccuracyCalculation.js";
import Constants from "../src/lib/gameplay/Constants.ts";
import {eq} from "drizzle-orm";
import path from "node:path";
import * as fs from "node:fs";
import {fileURLToPath} from "node:url";

const app = express()
const port = process.env.PORT || 3000

const db = drizzle(process.env.DB);

let difficulty = 1;
let PIN = new RNG(difficulty).get()

let sessions = {}

function censorBadWords(name) {
    const badwordsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'badwords.txt');
    const badwords = fs.readFileSync(badwordsPath, 'utf-8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

    let censored = name;
    badwords.forEach(pattern => {
        try {
            const regex = new RegExp(pattern, 'gi');
            censored = censored.replace(regex, match => '*'.repeat(match.length));
        } catch {}
    });
    return censored;
}

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'https://pindle.atomtables.dev');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const correct = async (sessionId, res) => {
    let session = sessions[sessionId];
    session.end = new Date();
    session.time = Math.round((session.end - session.start) / 1000);

    let id;

    console.log(session.submit);
    if (session.submit) {
        let val = await db.insert(leaderboard).values({
            name: session.name,
            time: session.time,
            attempts: session.attempts,
        }).returning()
        id = val[0].id;
        console.log(id);
    }

    res.send({
        code: 1000,
        message: "success",
        time: session.time,
        attempts: session.attempts,
        id
    })

    delete sessions[sessionId];
}

cron.schedule('0 0 * * *', () => {
    console.info('Clearing current day, creating new level.');
    db.delete(leaderboard)
    PIN = new RNG(difficulty).get();
    console.log(`New PIN for today: ${PIN}`);
});

app.use(express.json())

app.get('/', (req, res) => {
    res.send(JSON.stringify({
        version: "1.0.0",
        date: new Date().toDateString(),
        difficulty
    }))
})

app.get("/leaderboard", async (req, res) => {
    let results = await db.select().from(leaderboard);
    results.sort((a, b) => {
        if (Constants.conversion.get(a.attempts, a.time) > Constants.conversion.get(b.attempts, b.time)) {
            return 1;
        } else if (Constants.conversion.get(a.attempts, a.time) < Constants.conversion.get(b.attempts, b.time)) {
            return -1;
        } else {
            return 0;
        }
    });
    console.log(results);
    res.send(results)
})

app.post("/register", async (req, res) => {
    const { name, leaderboard: lb } = req.body;
    if (typeof name !== 'string' || typeof lb !== 'boolean') {
        return res.status(400).send({code: -1, message: "Please provide all necessary values."});
    }
    if (lb && ((await db.select().from(leaderboard).where(eq(leaderboard.name, name)))[0] || Object.values(sessions).find(session => session.name === name))) {
        return res.status(400).send({code: -2, message: "Name already exists"});
    }
    let sessionId = crypto.randomUUID();
    sessions[sessionId] = {
        name: censorBadWords(name),
        attempts: 0,
        start: new Date(),
        submit: lb
    }
    res.send({code: 0, sessionId, message: "Successfully started.", difficulty});
})

app.post("/attempt", async (req, res) => {
    const { sessionId, guess } = req.body;
    if (!sessions[sessionId]) {
        return res.status(400).send({code: -3, message: "Session not found."});
    }
    if (typeof guess !== 'string') {
        return res.status(400).send({code: -1, message: "Please provide a valid guess."});
    }

    let session = sessions[sessionId];
    session.attempts++;

    let accuracy = AccuracyCalculation(guess, PIN);
    if (guess === PIN) await correct(sessionId, res);

    res.send({
        code: 999,
        data: accuracy.sort().reverse()
    });
})

app.listen(port, () => {
    console.info(`Pindle daily server listening on port ${port}`)
    console.log(`Current PIN for today: ${PIN}`);
})