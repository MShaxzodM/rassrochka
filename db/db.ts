import knex from "knex";

// Create database object
const db = knex(
    {
        client: 'pg',
        connection: {
            host: 'localhost',
            user: 'postgres',
            password: '0000',
            database: 'rassrochka',
        },
    }
);


export {db}