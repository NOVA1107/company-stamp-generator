export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mbofzljyicjjqqwmefpd.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ib2Z6bGp5aWNqanFxd21lZnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTgwNzQsImV4cCI6MjA5MDE3NDA3NH0.WqRUFTb5_tO1n7eWiTisVQWth-5D-CZtnSYQHJ3QzLU';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('收到 Webhook:', body.event_type);

    // 简化版：先只返回 200，后续再加逻辑
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('最外层崩溃:', error);
    return new NextResponse('Error', { status: 200 });
  }
}