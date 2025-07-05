// app/api/transactions/route.ts
import { connectDB } from '@/lib/mongo';
import { Transaction } from '@/models/Transaction';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectDB();
  const transactions = await Transaction.find().sort({ createdAt: -1 });
  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const tx = await Transaction.create(body);
  return NextResponse.json(tx);
}
