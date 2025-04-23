import { logger } from "@/server";
import { type Dialect, type Options, Sequelize } from "sequelize";

// Import the environment variables from the .env file
import dotenv from "dotenv";
dotenv.config();

const dbConfig: Options = {
    dialect: "postgres" as Dialect,
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT) || 5432,
    database: process.env.POSTGRES_DB || "postgres",
    username: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "yourpassword",
    logging: false,
    define: {
        timestamps: false,
        freezeTableName: true,
    },
};

const sequelize = new Sequelize(dbConfig);

// Test the connection to the database
sequelize
    .authenticate()
    .then(() => {
        logger.info("Connection to the database has been established successfully.");
    })
    .catch((error) => {
        logger.error("Unable to connect to the database:", error);
    });

export default sequelize;
