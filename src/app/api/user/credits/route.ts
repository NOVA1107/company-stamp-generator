import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }
    
    // 实时从数据库查询最新额度
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, credits')
      .eq('email', session.user.email)
      .single()
    
    if (error || !profile) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }
    
    return NextResponse.json({
      id: profile.id,
      email: profile.email,
      credits: profile.credits
    })
    
  } catch (error) {
    console.error('查询额度失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
