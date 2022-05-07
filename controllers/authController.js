import "dotenv/config";
import _ from "lodash";
import CryptoJS from "crypto-js";
import DBMysql from "../clients/db.mysql.js";


const {
    TOKEN_SECRET,
} = process.env;


if (!TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET is missing");
}


export async function findById(id) {
    try {
        const [result] = await DBMysql.query(
            `select * from users where id = ? limit 1`,
            [id]
        );

        return result && result.length > 0 ? result[0] : null;

    } catch (err) {
        console.error(err);
        return null;
    }
}


export async function findByEmail(email) {
    try {
        const [result] = await DBMysql.query(
            `
                select *
                from users
                where email = ?
                    limit 1
            `,
            [email]
        );

        return result && result.length > 0 ? result[0] : null;

    } catch (err) {
        console.error(err);
        return null;
    }
}


export async function checkEmailUnique(email) {
    const user = await findByEmail(email);
    return !!user;
}


export async function create({ name, age, email, password }) {
    try {
        const [result] = await DBMysql.query(
            `
                insert into users
                    (name, age, email, password)
                values (?, ?, ?, ?)
            `,
            [name, age, email, password]
        );


        const id = result?.insertId || _.get(result, "0.insertId", null);

        return await findById(id);

    } catch (err) {
        console.error(err);
        return null;
    }
}


export async function update(id, { name, age, returnData = false }) {
    try {

        const result = await DBMysql.query(
            `
                update users
                set name = ?,
                    age = ?
                where id = ?
            `,
            [name, age, id]
        );


        const affectedRows = _.get(result, "0.affectedRows", null);


        return returnData
            ? await findById(id)
            : affectedRows > 0;


    } catch (err) {
        console.error(err);
        return null;
    }
}
////

export async function updatePassword(id, hashedPassword) {
    try {
        const [result] = await DBMysql.query(
            `UPDATE users SET password = ? WHERE id = ?`,
            [hashedPassword, id]
        );
        console.log("MySQL Result:", result);
        if (result && (result.affectedRows > 0 || result.changedRows >= 0)) {
            return true;
        }
        return false;
    } catch (err) {
        console.error("SQL Error:", err);
        return null;
    }
}

export async function updatePhoto(id, photo,background) {
    try {
        const [result] = await DBMysql.query(
            `UPDATE confirms
             SET photo = COALESCE(?, photo),
                 background = COALESCE(?, background)
             WHERE user_id  = ?`,
            [photo ?? null, background ?? null, id]
        );
        // console.log("MySQL Result:", result);
        return result.affectedRows > 0;
    } catch (err) {
        console.error("SQL Error:", err);
        return null;
    }
}

// Encrypt
export function encrypt(data) {

    return CryptoJS.AES.encrypt(
        JSON.stringify(data),
        TOKEN_SECRET
    ).toString();

}


// Decrypt
export function decrypt(ciphertext) {

    try {

        const bytes = CryptoJS.AES.decrypt(
            ciphertext,
            TOKEN_SECRET
        );


        return JSON.parse(
            bytes.toString(CryptoJS.enc.Utf8)
        );


    } catch (e) {

        console.log(e);
        return null;

    }
}



export default {
    findById,
    create,
    update,
    checkEmailUnique,
    findByEmail,
    encrypt,
    decrypt,
    updatePassword,
};