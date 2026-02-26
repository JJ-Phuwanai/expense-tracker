"use client";

import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Expense, formatMoney } from "@/lib/finance-utils";

interface HistoryListProps {
  expenses: Expense[];
  loading: boolean;
}

export function HistoryList({ expenses, loading }: HistoryListProps) {
  if (loading) {
    return (
      <div className="text-center py-20 text-muted-foreground animate-pulse text-sm">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground text-sm border-2 border-dashed rounded-[2rem] opacity-50 bg-background/50">
        ไม่พบรายการตามเงื่อนไข
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      {expenses.map((e, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-card border border-border/40 rounded-2xl shadow-sm transition-all active:scale-[0.98]"
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
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground leading-tight truncate">
                {e.item}
              </p>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                {e.date} • {e.category}
              </p>
            </div>
          </div>
          {/* แสดงเครื่องหมาย +/- ตามประเภทรายการ */}
          <p
            className={`font-mono text-base font-extrabold shrink-0 ${e.type === "รายรับ" ? "text-primary" : "text-foreground"}`}
          >
            {e.type === "รายรับ" ? "+" : "-"}
            {formatMoney(Number(e.amount))}
          </p>
        </div>
      ))}
    </div>
  );
}
