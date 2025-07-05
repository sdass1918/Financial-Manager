// models/Transaction.ts
import mongoose, { Schema } from 'mongoose';

const TransactionSchema = new Schema({
  amount: Number,
  date: String,
  description: String,
  category: { type: String, default: 'Other' }
}, { timestamps: true });

export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
