import dotenv from 'dotenv';
dotenv.config();

const {MONGO_URI, PORT, BOT_TOKEN} = process.env;

export {MONGO_URI, PORT, BOT_TOKEN};
