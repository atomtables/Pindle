import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const leaderboard = sqliteTable("leaderboard", {
    id: int("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    attempts: int("attempts").notNull().default(Infinity),
    time: int("time").notNull().default(Infinity),
});
