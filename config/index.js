import dotenv from 'dotenv'
dotenv.config();

export const configJWT = {
    private_key: process.env.SECRET_KEY
}