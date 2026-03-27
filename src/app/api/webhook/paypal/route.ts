export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface PayPalWebhookEvent {
  event_type: string;
  id: string;
  resource: {
    id: string;
    custom_id?: string;
    amount?: {
      value: string;
      currency_code: string;
    };
    billing_info?: {
      email_address?: string;
    };
    supplementary_data?: {
      related_ids?: {
        billing_agreement_id?: string;
      };
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: PayPalWebhookEvent = await request.json();
    const eventType = body.event_type;
    const webhookId = body.id;
    const resource = body.resource;

    console.log('========== PayPal Webhook 收到 ==========');
    console.log('Event Type:', eventType);
    console.log('Webhook ID:', webhookId);
    console.log('Resource ID:', resource?.id);
    console.log('Full Body:', JSON.stringify(body));

    // 检查是否已处理过该 webhook（防重）
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('paypal_order_id', webhookId)
      .single();

    console.log('查重结果:', { existingOrder, checkError });

    if (existingOrder) {
      console.log('Webhook 已处理过，跳过:', webhookId);
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (eventType === 'PAYMENT.SALE.COMPLETED') {
      console.log('开始处理支付完成事件...');

      let customData: { planId?: string; credits?: number } = {};
      
      if (resource.custom_id) {
        try {
          customData = JSON.parse(resource.custom_id);
          console.log('解析 custom_id:', customData);
        } catch (e) {
          console.log('custom_id 不是 JSON 格式，可能是旧格式，直接使用:', resource.custom_id);
          // 兼容旧格式：直接用 custom_id 作为 planId
          customData = { planId: resource.custom_id, credits: 5 };
        }
      }

      const { planId, credits } = customData;
      const amount = resource.amount?.value || '0';
      const currency = resource.amount?.currency_code || 'USD';

      console.log('准备写入订单:', { webhookId, planId, credits, amount, currency });

      // 写入订单
      const { data: insertData, error: insertError } = await supabase
        .from('orders')
        .insert({
          paypal_order_id: webhookId,
          plan_id: planId || 'unknown',
          credits: credits || 0,
          amount: amount,
          currency: currency,
          status: 'completed',
          created_at: new Date().toISOString()
        })
        .select();

      console.log('数据库写入状态:', { data: insertData, error: insertError });

      if (insertError) {
        console.error('❌ 数据库写入失败:', insertError);
        return NextResponse.json({ 
          error: "Database insert failed", 
          details: insertError.message 
        }, { status: 500 });
      }

      console.log('✅ 订单写入成功!');
      return NextResponse.json({ received: true, success: true, orderId: insertData?.[0]?.id });
    }

    console.log('非 PAYMENT.SALE.COMPLETED 事件，直接返回成功');
    return NextResponse.json({ received: true, eventType });

  } catch (error: any) {
    console.error('❌ Webhook 错误:', error);
    return NextResponse.json({ 
      error: "Webhook processing failed", 
      details: error.message 
    }, { status: 500 });
  }
}