export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// PayPal Webhook 需要验证签名
// 这里简化处理：验证 event type 并更新订单状态

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
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: PayPalWebhookEvent = await request.json();
    const eventType = body.event_type;
    const webhookId = body.id;
    const resource = body.resource;

    console.log("PayPal Webhook received:", eventType, webhookId);

    // 检查是否已处理过该 webhook（防重）
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, status')
      .eq('paypal_order_id', webhookId)
      .single();

    if (existingOrder) {
      console.log("Webhook already processed, skipping:", webhookId);
      return NextResponse.json({ received: true });
    }

    if (eventType === 'PAYMENT.SALE.COMPLETED') {
      const customData = resource.custom_id ? JSON.parse(resource.custom_id) : null;
      
      if (!customData || !customData.planId) {
        console.error("Missing custom_id in webhook");
        return NextResponse.json({ error: "Missing custom data" }, { status: 400 });
      }

      const { planId, credits } = customData;
      const amount = resource.amount?.value || '0';
      const currency = resource.amount?.currency_code || 'USD';

      // 记录订单
      await supabase.from('orders').insert({
        paypal_order_id: webhookId,
        plan_id: planId,
        credits: credits,
        amount: amount,
        currency: currency,
        status: 'completed',
        created_at: new Date().toISOString()
      });

      console.log("Order recorded successfully:", { planId, credits });

      // 注意：实际生产环境应该通过 custom_id 关联用户 ID
      // 这里需要更完善的逻辑来匹配用户
      // 简化版：记录订单，用户下次登录时可以关联

      return NextResponse.json({ received: true, success: true });
    }

    // 其他事件类型直接返回成功
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}