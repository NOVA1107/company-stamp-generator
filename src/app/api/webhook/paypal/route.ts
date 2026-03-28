export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mbofzljyicjjqqwmefpd.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔑 SERVICE_ROLE_KEY 存在:', !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseServiceKey || '');

export async function GET() {
  return new Response('Webhook is alive');
}

export async function POST(req: Request) {
  console.log('🚀 Webhook 进门了，准备解析...');
  
  try {
    const body = await req.json();
    console.log('📥 原始 Payload:', JSON.stringify(body, null, 2));

    // 检查支付状态
    if (body.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      console.log('⏭️ 非 COMPLETED 状态，跳过处理:', body.event_type);
      return new NextResponse('OK', { status: 200 });
    }

    const resource = body.resource;
    const customIdStr = resource.custom_id;
    
    if (!customIdStr) {
      console.error('❌ 缺少 custom_id，无法识别用户');
      return new NextResponse('OK', { status: 200 });
    }

    // 解析 custom_id 获取用户身份
    let customData;
    try {
      customData = JSON.parse(customIdStr);
    } catch (e) {
      console.error('❌ custom_id 解析失败:', customIdStr);
      return new NextResponse('OK', { status: 200 });
    }

    const userId = customData.userId;
    const creditsToAdd = customData.credits || 20;

    console.log('👤 识别到用户:', userId);
    console.log('💰 将要添加额度:', creditsToAdd);

    if (!userId) {
      console.error('❌ custom_id 中缺少 userId');
      return new NextResponse('OK', { status: 200 });
    }

    // 1. 先查询用户当前额度
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ 查询用户失败:', profileError);
    }

    const currentCredits = profile?.credits || 0;
    const newCredits = currentCredits + creditsToAdd;

    // 2. 为用户加钱
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ 加钱失败:', updateError);
    } else {
      console.log('✅ 加钱成功! 用户', userId, '新额度:', newCredits);
    }

    // 3. 记录订单（不做任何UNIQUE校验）
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        order_id: resource.id || 'unknown',
        status: 'success',
        amount: resource.amount?.value || resource.purchase_units?.[0]?.amount?.value || '0',
        currency: resource.amount?.currency_code || 'USD',
        payer_email: resource.payer?.email_address || '',
        raw_data: JSON.stringify(customData)
      });

    if (orderError) {
      console.error('⚠️ 记账失败（不影响主流程）:', orderError);
    } else {
      console.log('✅ 订单记录成功');
    }

    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('💥 Webhook 崩溃:', error);
    // 兜底返回 200，防止 PayPal 无限重发
    return new NextResponse('OK', { status: 200 });
  }
}
