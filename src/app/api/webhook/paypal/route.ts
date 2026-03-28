export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mbofzljyicjjqqwmefpd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ 缺少 SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || '');

export async function GET() {
  return new Response('Webhook is alive');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('========== PayPal 原始数据 ==========');
    console.log(JSON.stringify(body, null, 2));
    console.log('======================================');

    // 支付 webhook 处理
    if (body.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = body.resource;
      
      console.log('📦 resource.id:', resource.id);
      console.log('📦 resource.custom_id:', resource.custom_id);
      console.log('📦 resource.invoice_id:', resource.invoice_id);
      
      // 优先用 custom_id，其次用 invoice_id，最后用 resource.id
      const orderId = resource.custom_id || resource.invoice_id || resource.id || 'unknown';
      
      console.log('📦 最终订单ID:', orderId);
      
      // 直接写入 orders 表，无任何限制
      const insertData = {
        order_id: orderId,
        status: 'completed',
        amount: resource.amount?.value || '0',
        currency: resource.amount?.currency_code || 'USD',
        payer_email: resource.payer?.email_address || '',
        payer_name: resource.payer?.name?.given_name + ' ' + resource.payer?.name?.surname || '',
        raw_data: JSON.stringify(resource),
        created_at: new Date().toISOString()
      };

      console.log('📝 准备写入:', JSON.stringify(insertData, null, 2));

      const { data, error } = await supabase
        .from('orders')
        .insert(insertData);

      if (error) {
        console.error('💥 数据库写入失败!!!');
        console.error('💥 Error Code:', error.code);
        console.error('💥 Error Message:', error.message);
        console.error('💥 Error Details:', error.details);
        console.error('💥 完整 Error:', JSON.stringify(error, null, 2));
        // 大声喊出来，不默默返回
        return new NextResponse('DB Error: ' + error.message, { status: 500 });
      }

      console.log('✅ 订单写入成功!!!');
      console.log('✅ 返回数据:', JSON.stringify(data, null, 2));
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('💥 Webhook 崩溃:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
