// app/api/transactions/[id]/route.ts

import { connectDB } from '@/lib/mongo';
import { Transaction } from '@/models/Transaction';
import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  await Transaction.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}