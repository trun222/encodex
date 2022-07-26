import mongoose from 'mongoose';

export const NotificationSchema = new mongoose.Schema({
  user: { type: String },
  avatar: { type: String },
  title: { type: String },
  event: { type: String },
  timestamp: { type: String },
  status: { type: String },
  type: { type: String },
});
