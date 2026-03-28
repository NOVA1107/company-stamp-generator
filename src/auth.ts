import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { supabase } from "@/lib/supabase"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      
      // 🔑 核心：以 Email 为唯一凭证查询
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, credits')
        .eq('email', user.email)
        .single()
      
      if (!existingProfile) {
        // 真正的新用户（该邮箱第一次登录）：创建并赠送 3 额度
        await supabase.from('profiles').insert({
          id: user.id,  // 使用 NextAuth 生成的 id
          email: user.email,
          avatar_url: user.image,
          credits: 3
        })
        console.log('🆕 新用户注册（按 Email），赠送 3 额度:', user.email)
      } else {
        // 老用户：更新信息，用旧的 profile id
        // 注意：不再更新 user.id，因为我们要以 email 为准
        await supabase
          .from('profiles')
          .update({ 
            avatar_url: user.image,
            updated_at: new Date().toISOString() 
          })
          .eq('email', user.email)
        console.log('👋 老用户登录（按 Email），额度保持:', existingProfile.credits)
      }
      
      return true
    },
    async session({ session, token }) {
      // 以 Email 为准获取用户信息
      if (session.user && session.user.email) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, credits')
          .eq('email', session.user.email)
          .single()
        
        if (profile) {
          session.user.id = profile.id
          session.user.credits = profile.credits
        }
      }
      return session
    }
  }
})