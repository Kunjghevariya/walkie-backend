import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  code: { type: String, unique: true, required: true },
  avatar: String,
online: { type: Boolean, default: false },
lastSeen: { type: Date },
dob: { type: String }, // or use Date if preferred

}, { timestamps: true });

export default mongoose.model('User', userSchema);