import mongoose from 'mongoose';

const RefreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: String, required: true },
  valid: { type: Boolean, default: true },
  replacedBy: { type: String, default: null },
  createdAt: { type: Date, default: Date.now, expires: "7d" } // auto-expire after 7 days
});
export default mongoose.model('RefreshToken', RefreshTokenSchema);