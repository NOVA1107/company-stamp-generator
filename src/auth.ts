import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { supabase } from "@/lib/supabase"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      
      // 🔑 以 Email 为唯一凭证查询
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, credits')
        .eq('email', user.email)
        .single()
      
      if (!existingProfile) {
        // 真正的新用户：创建并赠送 3 额度
        const newId = user.id // 使用 NextAuth 生成的 id
        await supabase.from('profiles').insert({
          id: newId,
          email: user.email,
          avatar_url: user.image,
          credits: 3
        })
        console.log('🆕 新用户注册，赠送 3 额度:', user.email)
      } else {
        // 老用户：更新头像和最后登录时间
        await supabase
          .from('profiles')
          .update({ 
            avatar_url: user.image,
            updated_at: new Date().toISOString() 
          })
          .eq('email', user.email)
        console.log('👋 老用户登录，额度保持:', existingProfile.credits)
      }
      
      return true
    },
    
    async jwt({ token, user }) {
      // 🔑 关键：在 JWT 阶段根据 email 查出 profile id 并存入 token
      if (user?.email) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, credits')
          .eq('email', user.email)
          .single()
        
        if (profile) {
          token.id = profile.id
          token.credits = profile.credits
        }
      }
      return token
    },
    
    async session({ session, token }) {
      // 将 token 中的 id 和 credits 传给 session
      if (session.user) {
        session.user.id = token.id as string
        session.user.credits = token.credits as number
      }
      return session
    }
  }
})
