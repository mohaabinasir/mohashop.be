import { MONGO_URI } from './config.js';
import mongoose from 'mongoose';

const connectDB = async() => {
    try{
    await mongoose.connect(MONGO_URI);
    console.log('successfuly connected database');
    } catch(err) {
    console.log('failed to connected database err: ' + err);
    }
}

export default connectDB;
