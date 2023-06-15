import knex from "knex";
import { config } from "dotenv";
config();
// Create database object
const db = knex({
    client: "pg",
    connection: {
        host: "localhost",
        user: "postgres",
        port: 5432,
        charset: "utf8",
        password: process.env.POSTGRES_PASSWORD,
        database: "rassrochka",
    },
});
export { db };
