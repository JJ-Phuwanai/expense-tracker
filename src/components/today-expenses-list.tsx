"use client";

import { useMemo } from "react";
import { Wallet, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { todayDDMMYYYY } from "@/lib/date";

interface TodayExpensesListProps {
  expenses: any[];
  loading: boolean;
}

export function TodayExpensesList({
  expenses,
  loading,
}: TodayExpensesListProps) {
  // กรองเฉพาะรายการที่เป็นของวันนี้
  const todayExpenses = useMemo(() => {
    const today = todayDDMMYYYY();
    return expenses.filter((e) => e.date === today);
  }, [expenses]);

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground text-center py-10 animate-pulse font-medium">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (todayExpenses.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-12 border-2 border-dashed rounded-[2rem] opacity-50 bg-background/50">
        ยังไม่มีรายการของวันนี้
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todayExpenses.map((e, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-card border border-border/40 rounded-2xl shadow-sm transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`p-2 rounded-full ${e.type === "รายรับ" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}
            >
              {e.type === "รายรับ" ? (
                <ArrowUpCircle size={20} />
              ) : (
                <ArrowDownCircle size={20} />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">
                {e.item}
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                {e.category}
              </p>
            </div>
          </div>
          <p
            className={`font-mono text-base font-extrabold ${e.type === "รายรับ" ? "text-primary" : "text-destructive"}`}
          >
            {e.type === "รายรับ" ? "+" : "-"}
            {Number(e.amount).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
