export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    // 未登录用户不允许下载
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "请先登录后下载高清印章" },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // 查询用户当前 credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()
    
    if (profileError) {
      console.error('查询用户资料失败:', profileError)
      return NextResponse.json(
        { error: "用户资料查询失败" },
        { status: 500 }
      )
    }
    
    // 检查额度是否充足
    if (!profile || profile.credits <= 0) {
      return NextResponse.json(
        { error: "额度不足，请购买额度包后继续" },
        { status: 403 }
      )
    }
    
    // 额度充足，扣除 1 个 credit
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', userId)
    
    if (updateError) {
      console.error('扣费失败:', updateError)
      return NextResponse.json(
        { error: "扣费失败，请重试" },
        { status: 500 }
      )
    }
    
    // 扣费成功，记录印章生成历史
    const body = await request.json()
    await supabase.from('stamps').insert({
      user_id: userId,
      config_json: JSON.stringify(body.config || {}),
      created_at: new Date().toISOString()
    })
    
    return NextResponse.json({
      success: true,
      remainingCredits: profile.credits - 1
    })
    
  } catch (error) {
    console.error('下载API错误:', error)
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    )
  }
}