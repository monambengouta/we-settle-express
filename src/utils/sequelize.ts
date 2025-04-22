import { logger } from '@/server';
import { Sequelize } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';

// Import the environment variables from the .env file
import dotenv from 'dotenv';
dotenv.config();

export const sequelize: Sequelize = new Sequelize({
    dialect: PostgresDialect,

    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: false,
    clientMinMessages: 'notice',
});

// Test the connection to the database
sequelize.authenticate()
    .then(() => {
        logger.info('Connection to the database has been established successfully.');
    })
    .catch((error) => {
        logger.error('Unable to connect to the database:', error);
    });