export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mbofzljyicjjqqwmefpd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ 缺少 SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || '');

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('收到 Webhook:', body.event_type);

    // 支付 webhook 处理
    if (body.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = body.resource;
      
      // 尝试从 custom_id 或 invoice_id 获取订单信息
      const orderId = resource.custom_id || resource.invoice_id || 'unknown';
      
      console.log('📦 订单ID:', orderId);
      
      // 直接写入 orders 表，无任何限制
      const { error } = await supabase
        .from('orders')
        .insert({
          order_id: orderId,
          status: 'completed',
          amount: resource.amount?.value || '0',
          currency: resource.amount?.currency_code || 'USD',
          payer_email: resource.payer?.email_address || '',
          payer_name: resource.payer?.name?.given_name + ' ' + resource.payer?.name?.surname || '',
          raw_data: JSON.stringify(resource),
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ 写入失败:', error);
        return new NextResponse('Error', { status: 200 });
      }

      console.log('✅ 订单写入成功:', orderId);
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('❌ Webhook 崩溃:', error);
    return new NextResponse('Error', { status: 200 });
  }
}
