import DBMysql from "./clients/db.mysql.js";

async function runMigration() {
    try {
        console.log("Checking database connection and running migration...");

        const createUsersTableSQL = `
            CREATE TABLE IF NOT EXISTS users (
                                                 id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                 name VARCHAR(255) NOT NULL,
                age INT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL DEFAULT 'user'
                );
        `;

        await DBMysql.query(createUsersTableSQL);

        console.log('"users" table created successfully.',);

    } catch (error) {
        console.error("Error:", error.message);
    }
}

export default runMigration;