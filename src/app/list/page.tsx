'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseDDMMYYYY } from '@/lib/date';
import { HistoryHeader } from '@/components/history-header';
import { HistoryFilters } from '@/components/history-filters';
import { HistoryList } from '@/components/history-list';
import { Expense, toStartOfDay, toEndOfDay } from '@/lib/finance-utils';

export default function HistoryPage() {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    // เพิ่ม State สำหรับจัดการ Tabs
    const [activeTab, setActiveTab] = useState<'รายจ่าย' | 'รายรับ'>('รายจ่าย');

    const [q, setQ] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [fromISO, setFromISO] = useState('');
    const [toISO, setToISO] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/expenses', { cache: 'no-store' });
            const data = await res.json();
            setExpenses(data.expenses ?? []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // ปรับปรุงการกรองข้อมูลให้รองรับการแยก Tab
    const filteredByTab = useMemo(() => {
        const query = q.trim().toLowerCase();
        const fromDate = fromISO ? toStartOfDay(new Date(fromISO)) : null;
        const toDate = toISO ? toEndOfDay(new Date(toISO)) : null;

        return expenses.filter((e) => {
            // 1. กรองตามประเภทของ Tab ที่เลือก
            if (e.type !== activeTab) return false;

            // 2. กรองตามคำค้นหา
            if (query && !`${e.item} ${e.category}`.toLowerCase().includes(query)) return false;

            // 3. กรองตามหมวดหมู่
            if (filterCategory !== 'all' && e.category !== filterCategory) return false;

            // 4. กรองตามวันที่ (พร้อมตรวจสอบความถูกต้อง)
            if (fromDate || toDate) {
                const d = parseDDMMYYYY(e.date) as any;
                const isValid = d instanceof Date && !isNaN(d.getTime());
                if (!isValid) return false;

                if (fromDate && d.getTime() < fromDate.getTime()) return false;
                if (toDate && d.getTime() > toDate.getTime()) return false;
            }
            return true;
        });
    }, [expenses, q, filterCategory, fromISO, toISO, activeTab]);

    const summary = useMemo(() => {
        const total = filteredByTab.reduce((sum, e) => sum + Number(e.amount ?? 0), 0);
        return { count: filteredByTab.length, total };
    }, [filteredByTab]);

    const uniqueCategories = useMemo(() => {
        return Array.from(new Set(expenses.map((e) => e.category)))
            .filter(Boolean)
            .sort();
    }, [expenses]);

    return (
        <main className="h-screen max-w-md mx-auto flex flex-col overflow-hidden bg-muted/40 font-sans">
            <div className="flex-none p-6 pb-2 space-y-6">
                <HistoryHeader count={summary.count} total={summary.total} loading={loading} onRefresh={load} />

                {/* Tabs Selector */}
                <div className="flex p-1 bg-card rounded-2xl border border-border/40 shadow-sm">
                    {(['รายจ่าย', 'รายรับ'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === tab
                                    ? 'bg-muted text-foreground shadow-inner scale-[0.98]'
                                    : 'text-muted-foreground opacity-50 hover:opacity-80'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Filters (ปรับปรุงใหม่) */}
                <HistoryFilters
                    q={q}
                    setQ={setQ}
                    filterCategory={filterCategory}
                    setFilterCategory={setFilterCategory}
                    fromISO={fromISO}
                    setFromISO={setFromISO}
                    toISO={toISO}
                    setToISO={setToISO}
                    onReset={() => {
                        setQ('');
                        setFilterCategory('all');
                        setFromISO('');
                        setToISO('');
                    }}
                    categories={uniqueCategories}
                />
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-24">
                <HistoryList expenses={filteredByTab} loading={loading} />
            </div>
        </main>
    );
}
