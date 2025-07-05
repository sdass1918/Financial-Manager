// app/api/transactions/[id]/route.ts
import { connectDB } from '@/lib/mongo';
import { Transaction } from '@/models/Transaction';
import { NextResponse } from 'next/server';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  await Transaction.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
