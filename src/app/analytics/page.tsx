"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  Wallet,
  ReceiptText,
  ArrowLeft,
  CreditCard,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";

export default function AnalyticsPage() {
  const router = useRouter();
  const { currentUserId, userName, users, switchUser } = useUser();
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [dailyExpenses, setDailyExpenses] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resPlans, resExp] = await Promise.all([
        fetch(`/api/budget-plan?personId=${currentUserId}`, {
          cache: "no-store",
        }),
        fetch(`/api/expenses?personId=${currentUserId}`, { cache: "no-store" }),
      ]);
      const dataPlans = await resPlans.json();
      const dataExp = await resExp.json();
      setPlans(dataPlans.plans || []);
      setDailyExpenses(dataExp.expenses || []);
    } catch (err) {
      console.error("Load analytics failed", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    const bySection: Record<string, number> = {};

    plans.forEach((p) => {
      const amt = Number(p.amount) || 0;
      if (p.section === "เงินเดือน") {
        income += amt;
      } else if (p.note === "จ่ายแล้ว") {
        expense += amt;
        bySection[p.section] = (bySection[p.section] || 0) + amt;
      }
    });

    const userItems = dailyExpenses.filter((item) => item.owner === userName);
    let dailyIncome = 0;
    let dailyExpense = 0;
    userItems.forEach((item) => {
      const amt = Number(item.amount) || 0;
      if (item.type === "รายรับ") dailyIncome += amt;
      else dailyExpense += amt;
    });

    const netDailySpent = dailyExpense - dailyIncome;
    if (netDailySpent > 0) {
      expense += netDailySpent;
      bySection["ค่าใช้จ่ายประจำเดือน"] = netDailySpent;
    }

    const chartData = Object.entries(bySection)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { income, expense, net: income - expense, chartData, netDailySpent };
  }, [plans, dailyExpenses, userName]);

  return (
    <main className="h-screen max-w-md mx-auto flex flex-col bg-muted/40 font-sans overflow-hidden">
      <div className="p-6 pt-8 bg-muted/40 backdrop-blur-md relative z-50">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1 relative">
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="flex items-center gap-1 group active:scale-95 transition-all"
              >
                <h2 className="text-2xl font-black tracking-tighter text-foreground">
                  สถิติของ {userName}
                </h2>
                <ChevronDown
                  size={18}
                  className={`text-muted-foreground transition-transform ${showPicker ? "rotate-180" : ""}`}
                />
              </button>

              {showPicker && (
                <div className="absolute top-full left-8 mt-2 w-40 bg-card border border-border/40 rounded-2xl shadow-xl p-2 z-[100] animate-in zoom-in-95 duration-200">
                  {users.map((u: any) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowPicker(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold rounded-xl hover:bg-muted transition-colors"
                    >
                      {u.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-1">
              สรุปยอดค่าใช้จ่ายรายเดือน
            </p>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-muted-foreground font-bold uppercase block mb-1">
              คงเหลือ
            </span>
            <span
              className={`text-xl font-black tabular-nums leading-none ${summary.net >= 0 ? "text-emerald-600" : "text-destructive"}`}
            >
              ฿{summary.net.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-6 scrollbar-hide">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card p-4 rounded-[1.8rem] border border-border/40 text-center shadow-sm">
            <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">
              รายได้
            </p>
            <p className="text-sm font-black text-emerald-600">
              ฿{summary.income.toLocaleString()}
            </p>
          </div>
          <div className="bg-card p-4 rounded-[1.8rem] border border-border/40 text-center shadow-sm">
            <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">
              รายจ่าย
            </p>
            <p className="text-sm font-black text-destructive">
              ฿{summary.expense.toLocaleString()}
            </p>
          </div>
          <div className="bg-card p-4 rounded-[1.8rem] border border-primary/10 text-center flex flex-col justify-center items-center bg-primary/5">
            <TrendingUp size={16} className="text-primary mb-1" />
            <p className="text-[9px] font-black text-primary uppercase">
              Analytics
            </p>
          </div>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-card p-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-6">
            สัดส่วนรายจ่ายแยกตามหมวด
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary.chartData}
                margin={{ top: 10, right: 10, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  strokeOpacity={0.1}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: "bold", fill: "#888" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: "bold", fill: "#888" }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  formatter={(val: any) => [
                    `฿${Number(val || 0).toLocaleString()}`,
                    "ยอดจ่ายจริง",
                  ]}
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={35}>
                  {summary.chartData.map((e, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={
                        ["#3b82f6", "#f43f5e", "#f59e0b", "#10b981", "#8b5cf6"][
                          i % 5
                        ]
                      }
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-3 pb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">
            รายการที่ชำระเงินแล้ว
          </h3>

          {summary.netDailySpent > 0 && (
            <div className="flex items-center justify-between p-4 bg-orange-500/5 rounded-[1.5rem] border border-orange-500/10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600">
                  <CreditCard size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-foreground leading-tight">
                    ค่าใช้จ่ายประจำเดือน (สุทธิ)
                  </p>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">
                    รายการรายวันของ {userName}
                  </p>
                </div>
              </div>
              <p className="text-sm font-black text-foreground">
                ฿{summary.netDailySpent.toLocaleString()}
              </p>
            </div>
          )}

          {plans
            .filter((l) => l.note === "จ่ายแล้ว" && l.section !== "เงินเดือน")
            .map((line) => (
              <div
                key={line.rowIndex}
                className="flex items-center justify-between p-4 bg-card rounded-[1.5rem] border border-border/20 shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-destructive/5 text-destructive">
                    <ReceiptText size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-foreground leading-tight truncate">
                      {line.item}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">
                      {line.section} • {line.date}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-black tabular-nums text-foreground">
                  ฿{line.amount.toLocaleString()}
                </p>
              </div>
            ))}

          {loading && (
            <div className="py-10 text-center animate-pulse text-xs font-bold text-muted-foreground">
              กำลังสรุปข้อมูล...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
