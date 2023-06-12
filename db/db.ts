import knex from "knex";

// Create database object
const db = knex({
    client: "pg",
    connection: {
        host: "localhost",
        user: "postgres",
        port: 5432,
        password: "new_password",
        database: "rassrochka",
    },
});
export { db };
