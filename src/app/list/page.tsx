"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { parseDDMMYYYY } from "@/lib/date";
import { HistoryHeader } from "@/components/history-header";
import { HistoryFilters } from "@/components/history-filters";
import { HistoryList } from "@/components/history-list";
import {
  Expense,
  SortKey,
  toStartOfDay,
  toEndOfDay,
} from "@/lib/finance-utils";

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [q, setQ] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [fromISO, setFromISO] = useState("");
  const [toISO, setToISO] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expenses", { cache: "no-store" });
      const data = await res.json();
      setExpenses(data.expenses ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const fromDate = fromISO ? toStartOfDay(new Date(fromISO)) : null;
    const toDate = toISO ? toEndOfDay(new Date(toISO)) : null;

    return expenses.filter((e) => {
      if (
        query &&
        !`${e.item} ${e.category} ${e.type}`.toLowerCase().includes(query)
      )
        return false;

      if (filterType !== "all" && e.type !== filterType) return false;
      if (filterCategory !== "all" && e.category !== filterCategory)
        return false;

      if (fromDate || toDate) {
        const d = parseDDMMYYYY(e.date) as any;

        const isValid = d instanceof Date && !isNaN(d.getTime());

        if (!isValid) {
          return false;
        }

        const dTime = d.getTime();

        if (fromDate && dTime < fromDate.getTime()) return false;
        if (toDate && dTime > toDate.getTime()) return false;
      }
      return true;
    });
  }, [expenses, q, filterType, filterCategory, fromISO, toISO]);
  const summary = useMemo(() => {
    const total = filtered.reduce((sum, e) => sum + Number(e.amount ?? 0), 0);
    return { count: filtered.length, total };
  }, [filtered]);

  return (
    <main className="h-screen max-w-md mx-auto flex flex-col overflow-hidden bg-muted/40 font-sans">
      <div className="flex-none p-6 pb-2 space-y-4">
        <HistoryHeader
          count={summary.count}
          total={summary.total}
          loading={loading}
          onRefresh={load}
        />
        <HistoryFilters
          q={q}
          setQ={setQ}
          filterType={filterType}
          setFilterType={setFilterType}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          fromISO={fromISO}
          setFromISO={setFromISO}
          toISO={toISO}
          setToISO={setToISO}
          onReset={() => {
            setQ("");
            setFilterType("all");
            setFilterCategory("all");
            setFromISO("");
            setToISO("");
          }}
          optionSets={{
            types: Array.from(new Set(expenses.map((e) => e.type))).sort(),
            categories: Array.from(
              new Set(expenses.map((e) => e.category)),
            ).sort(),
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <HistoryList expenses={filtered} loading={loading} />
      </div>
    </main>
  );
}
