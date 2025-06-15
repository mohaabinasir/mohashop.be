import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstname: {type: String},
    lastname: {type: String},
    id: {type: Number, unique: true, required: true},
    password: {type: String, required: true},
    level: {type: Number, default: 1},
    level_exp: { type: Number, default: 0},
    requests: { type: [mongoose.Schema.Types.Mixed], default: [] },
    thread_id: { type: Number}
});
userSchema.index({ id: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

export default User;
