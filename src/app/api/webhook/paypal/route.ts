export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mbofzljyicjjqqwmefpd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔑 SERVICE_ROLE_KEY 是否存在:', !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseServiceKey || '');

export async function GET() {
  return new Response('Webhook is alive');
}

export async function POST(req: Request) {
  console.log('🔥 收到 POST 请求，直接暴力写入！');
  
  try {
    // 暴力写入 TEST_ID，无任何验证！
    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_id: 'TEST_ID',
        status: 'test',
        amount: '0.01',
        currency: 'USD'
      });

    if (error) {
      console.error('💥 写入失败:', error);
      // 把错误详情放在 Response 里吐出来
      return new NextResponse(
        'DB Error: ' + JSON.stringify(error),
        { status: 500 }
      );
    }

    console.log('✅ 暴力写入成功！');
    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('💥 崩溃:', err);
    return new NextResponse('Error: ' + String(err), { status: 500 });
  }
}
