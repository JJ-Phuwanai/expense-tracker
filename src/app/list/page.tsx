'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseDDMMYYYY } from '@/lib/date';
import { HistoryHeader } from '@/components/budget-list/history-header';
import { HistoryFilters } from '@/components/budget-list/history-filters';
import { HistoryList } from '@/components/budget-list/history-list';
import { Expense, toStartOfDay, toEndOfDay } from '@/lib/finance-utils';
import { useUser } from '@/context/user-context';
import { EditPopup } from '@/components/budget-home/home-list-edit';
import { AnimatePresence } from 'framer-motion';

export default function HistoryPage() {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    const [activeTab, setActiveTab] = useState<'รายจ่าย' | 'รายรับ'>('รายจ่าย');

    const [q, setQ] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [fromISO, setFromISO] = useState('');
    const [toISO, setToISO] = useState('');

    const { users } = useUser();
    const [filterOwner, setFilterOwner] = useState('all');
    const ownerNames = users.map((u) => u.name);
    const [editingExpense, setEditingExpense] = useState<any>(null);

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

    const handleDelete = async (rowIndex: number) => {
        const res = await fetch('/api/expenses', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rowIndex }),
        });

        if (res.ok) {
            load();
        }
    };

    const handleUpdate = async (updatedData: any) => {
        const res = await fetch('/api/expenses', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });

        if (res.ok) {
            setEditingExpense(null);
            load();
        }
    };

    const filteredByTab = useMemo(() => {
        const query = q.trim().toLowerCase();
        const fromDate = fromISO ? toStartOfDay(new Date(fromISO + 'T00:00:00')) : null;
        const toDate = toISO ? toEndOfDay(new Date(toISO + 'T23:59:59')) : null;

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const hasActiveFilter =
            query !== '' || filterCategory !== 'all' || filterOwner !== 'all' || fromISO !== '' || toISO !== '';

        return expenses.filter((e) => {
            if (e.type !== activeTab) return false;

            let itemDate: Date | null = null;
            const dateParts = e.date.split('/');

            if (dateParts.length === 3) {
                itemDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
            } else if (dateParts.length === 2) {
                itemDate = new Date(parseInt(dateParts[1]), parseInt(dateParts[0]) - 1, 1);
            }

            if (!itemDate || isNaN(itemDate.getTime())) return false;

            if (!hasActiveFilter) {
                return itemDate.getMonth() + 1 === currentMonth && itemDate.getFullYear() === currentYear;
            }

            if (query && !`${e.item} ${e.category} ${e.owner}`.toLowerCase().includes(query)) return false;
            if (filterCategory !== 'all' && e.category !== filterCategory) return false;
            if (filterOwner !== 'all' && e.owner !== filterOwner) return false;

            if (fromDate && itemDate.getTime() < fromDate.getTime()) return false;
            if (toDate && itemDate.getTime() > toDate.getTime()) return false;

            return true;
        });
    }, [expenses, q, filterCategory, filterOwner, fromISO, toISO, activeTab]);

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

                <HistoryFilters
                    q={q}
                    setQ={setQ}
                    filterCategory={filterCategory}
                    setFilterCategory={setFilterCategory}
                    fromISO={fromISO}
                    owners={ownerNames}
                    filterOwner={filterOwner}
                    setFilterOwner={setFilterOwner}
                    setFromISO={setFromISO}
                    toISO={toISO}
                    setToISO={setToISO}
                    onReset={() => {
                        setQ('');
                        setFilterCategory('all');
                        setFilterOwner('all');
                        setFromISO('');
                        setToISO('');
                    }}
                    categories={uniqueCategories}
                />
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-24">
                <HistoryList
                    expenses={filteredByTab}
                    loading={loading}
                    onDelete={handleDelete}
                    onEdit={(e: any) => setEditingExpense(e)}
                />
            </div>

            <AnimatePresence>
                {editingExpense && (
                    <EditPopup expense={editingExpense} onClose={() => setEditingExpense(null)} onSave={handleUpdate} />
                )}
            </AnimatePresence>
        </main>
    );
}
