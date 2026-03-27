"use client";

import { useState } from "react";
import Link from "next/link";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID = "ATB5MF_H8sqZRyYAyX1fEFywA7QlS45XQO_kWIYKmBhb1clFwHkwcAyw02EDueccnIrEiEBwUSK8Nc09";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "4.99",
    credits: 5,
    description: "应急使用的临时客户",
    features: ["5 次印章下载", "高清无水印", "PDF 文档合成"],
    recommended: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "14.99",
    credits: 50,
    description: "企业用户的最佳选择",
    features: ["50 次印章下载", "高清无水印", "PDF 文档合成", "企业级品质保障"],
    recommended: true,
  },
];

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayPal, setShowPayPal] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowPayPal(true);
    setOrderCreated(false);
  };

  const createOrder = (data: any, actions: any) => {
    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) return;

    return actions.order.create({
      purchase_units: [
        {
          description: `${plan.name} - ${plan.credits} Credits`,
          amount: {
            currency_code: "USD",
            value: plan.price,
          },
          custom_id: JSON.stringify({ planId: plan.id, credits: plan.credits }),
        },
      ],
    });
  };

  const onApprove = async (data: any, actions: any) => {
    const details = await actions.order.capture();
    console.log("Payment captured:", details);
    alert("支付成功！额度将自动添加到您的账户。");
    setShowPayPal(false);
    setSelectedPlan(null);
  };

  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD" }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-800">🏢 公司印章生成器</Link>
            <Link href="/" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm">返回首页</Link>
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
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow ${
                  plan.recommended ? "border-2 border-red-500 relative" : ""
                }`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    推荐
                  </div>
                )}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                  <p className="text-gray-500 mt-1">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500 ml-2">/ {plan.credits}次额度</span>
                </div>
                <div className="text-sm text-gray-500 mb-6">
                  单次约 ${(Number(plan.price) / plan.credits).toFixed(2)}
                  {plan.recommended && <span className="text-green-600 font-medium ml-2">省 70%</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                {showPayPal && selectedPlan === plan.id ? (
                  <div className="mt-4">
                    <PayPalButtons
                      style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                      createOrder={createOrder}
                      onApprove={onApprove}
                      onError={(err) => {
                        console.error("PayPal Error:", err);
                        alert("支付失败，请重试");
                      }}
                    />
                    <button
                      onClick={() => {
                        setShowPayPal(false);
                        setSelectedPlan(null);
                      }}
                      className="w-full mt-3 py-2 text-gray-500 text-sm hover:text-gray-700"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`w-full py-3 rounded-xl font-medium transition ${
                      plan.recommended
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    立即购买
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12 text-gray-500 text-sm">
            <p>💳 安全支付 · 🚀 即时到账 · 🔒 数据保密</p>
          </div>
        </main>
      </div>
    </PayPalScriptProvider>
  );
}