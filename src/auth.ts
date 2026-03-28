import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { supabase } from "@/lib/supabase"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      
      // 检查用户是否已存在
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      
      // 如果不存在，则创建新用户，初始赠送 1 个 credit
      if (!existingUser) {
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          avatar_url: user.image,
          credits: 3  // 新用户赠送 3 个免费额度
        })
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