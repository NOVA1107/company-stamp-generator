export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('PayPal V2 Webhook:', JSON.stringify(body));

    const eventType = body.event_type;
    const resource = body.resource;

    // V2: 订单ID在 resource.id
    const orderId = resource?.id;
    const amount = resource?.amount?.value;
    const currency = resource?.amount?.currency_code;

    // V2: custom_id 在 resource.custom_id
    let customData = null;
    if (resource?.custom_id) {
      try {
        customData = JSON.parse(resource.custom_id);
      } catch {
        customData = { planId: resource.custom_id, credits: 5 };
      }
    }

    const { planId, credits } = customData || {};

    console.log('Event:', eventType, 'OrderID:', orderId, 'Amount:', amount);

    // V2: 只处理 CAPTURE 事件
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
      
      // 检查是否已处理
      const { data: existing } = await supabase
        .from('orders')
        .select('id')
        .eq('paypal_order_id', orderId)
        .single();

      if (existing) {
        console.log('订单已存在，跳过');
        return new Response('OK', { status: 200 });
      }

      // 写入订单
      const { data, error } = await supabase
        .from('orders')
        .insert({
          paypal_order_id: orderId,
          plan_id: planId || 'unknown',
          credits: credits || 0,
          amount: amount || '0',
          currency: currency || 'USD',
          status: 'completed',
          created_at: new Date().toISOString()
        })
        .select();

      console.log('写入结果:', { data, error });

      if (error) {
        console.error('DB Error:', error);
      } else {
        console.log('✅ 订单写入成功');
      }
    }

    // 强制返回 200
    return new Response('OK', { status: 200 });

  } catch (error: any) {
    console.error('Webhook Error:', error);
    // 即使出错也要返回 200，避免 PayPal 无限重试
    return new Response('OK', { status: 200 });
  }
}