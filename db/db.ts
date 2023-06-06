import knex from "knex";

// Create database object
const db = knex({
    client: "pg",
    connection: {
        host: "localhost",
        user: "postgres",
        port: 5432,
        password: "0000",
        database: "rassrochka",
    },
});
//PGPASSWORD=HifB5HNeJWOmL6Lbo9VPoxAOl67G7Eh7 psql -h dpg-chuu2i67avj345fci93g-a.oregon-postgres.render.com -U shaxzod rassrochka_ydv8
// PGPASSWORD=9oEHaYfGGlmsrdOhFpL3yJYP6EBK47GR psql -h dpg-chusbve7avj345emfor0-a.oregon-postgres.render.com -U shaxzod rassrochka
export { db };
