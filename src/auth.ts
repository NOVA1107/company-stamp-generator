import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { supabase } from "@/lib/supabase"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      
      // 先查询用户是否存在以及现有额度
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, credits')
        .eq('id', user.id)
        .single()
      
      if (!existingProfile) {
        // 全新用户：创建并赠送 3 个 credit
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          avatar_url: user.image,
          credits: 3
        })
        console.log('🆕 新用户注册，赠送 3 额度:', user.id)
      } else {
        // 老用户：只更新最后登录时间，不动 credits
        await supabase
          .from('profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', user.id)
        console.log('👋 老用户登录，额度保持不变:', user.id, '现有额度:', existingProfile.credits)
      }
      
      return true
    },
    async session({ session, token }) {
      // 将用户 ID 添加到 session 中
      if (session.user && token.sub) {
        session.user.id = token.sub
        
        // 获取最新的 credits 数量
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', token.sub)
          .single()
        
        if (profile) {
          session.user.credits = profile.credits
        }
      }
      return session
    }
  }
})