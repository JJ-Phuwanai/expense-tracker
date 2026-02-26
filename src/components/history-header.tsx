"use client";

import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/finance-utils";

interface HistoryHeaderProps {
  count: number;
  total: number;
  loading: boolean;
  onRefresh: () => void;
}

export function HistoryHeader({
  count,
  total,
  loading,
  onRefresh,
}: HistoryHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div>
        <h2 className="text-2xl font-black tracking-tight">รายการทั้งหมด</h2>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {count} รายการ • รวม {formatMoney(total)} บาท
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRefresh}
        className="rounded-full"
      >
        <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
      </Button>
    </div>
  );
}
