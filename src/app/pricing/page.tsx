export const runtime = 'edge';

import Link from "next/link";
import { auth } from "@/auth";

export default async function Pricing() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800">🏢 公司印章生成器</Link>
          <div>
            {session ? (
              <div className="flex items-center gap-3">
                {session.user?.image && <img src={session.user.image} alt="Avatar" className="w-8 h-8 rounded-full" />}
                <span className="text-sm text-gray-600">{session.user?.name}</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">额度: {session.user?.credits ?? 0}</span>
                <Link href="/" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm">返回首页</Link>
              </div>
            ) : (
              <Link href="/api/auth/signin" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">🔐 Google 登录</Link>
            )}
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">选择您的方案</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            按需购买额度包，无需订阅，按使用量付费
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Starter</h2>
              <p className="text-gray-500 mt-1">应急使用的临时客户</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$4.99</span>
              <span className="text-gray-500 ml-2">/ 5次额度</span>
            </div>
            <div className="text-sm text-gray-500 mb-6">
              单次约 $1.00
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                5 次印章下载
              </li>
              <li className="flex items-center text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                高清无水印
              </li>
              <li className="flex items-center text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                PDF 文档合成
              </li>
            </ul>
            <button 
              onClick={() => alert('支付系统对接中，即将上线！')}
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition"
            >
              立即购买
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-red-500 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              推荐
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Pro</h2>
              <p className="text-gray-500 mt-1">企业用户的最佳选择</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$14.99</span>
              <span className="text-gray-500 ml-2">/ 50次额度</span>
            </div>
            <div className="text-sm text-gray-500 mb-6">
              单次约 $0.30 <span className="text-green-600 font-medium">省 70%</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                50 次印章下载
              </li>
              <li className="flex items-center text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                高清无水印
              </li>
              <li className="flex items-center text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                PDF 文档合成
              </li>
              <li className="flex items-center text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                企业级品质保障
              </li>
            </ul>
            <button 
              onClick={() => alert('支付系统对接中，即将上线！')}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
            >
              立即购买
            </button>
          </div>
        </div>

        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>💳 安全支付 · 🚀 即时到账 · 🔒 数据保密</p>
        </div>
      </main>
    </div>
  );
}