'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type Expense = {
    date: string;
    item: string;
    type: string;
    amount: number;
    category: string;
    owner: string;
};

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    async function load() {
        setLoading(true);
        const data = await fetch('/api/expenses').then((r) => r.json());
        setExpenses(data.expenses ?? []);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    const summary = useMemo(() => {
        let income = 0;
        let expense = 0;

        const byCategory = new Map<string, number>();

        for (const e of expenses) {
            const amt = Number(e.amount) || 0;
            if (e.type === 'รายรับ') income += amt;
            else expense += amt;

            // ทำกราฟเฉพาะ "รายจ่าย" ตามหมวด
            if (e.type !== 'รายรับ') {
                const key = e.category || 'ไม่ระบุ';
                byCategory.set(key, (byCategory.get(key) ?? 0) + amt);
            }
        }

        const categoryData = Array.from(byCategory.entries())
            .map(([category, total]) => ({ category, total }))
            .sort((a, b) => b.total - a.total);

        return { income, expense, net: income - expense, categoryData };
    }, [expenses]);

    return (
        <main className="mx-auto max-w-4xl p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">สรุป statement</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-sm text-muted-foreground">กำลังโหลด...</div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">รายรับรวม</div>
                                <div className="text-lg tabular-nums">{summary.income.toLocaleString()}</div>
                            </div>
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">รายจ่ายรวม</div>
                                <div className="text-lg tabular-nums">{summary.expense.toLocaleString()}</div>
                            </div>
                            <div className="rounded-md border p-3">
                                <div className="text-xs text-muted-foreground">คงเหลือ</div>
                                <div className="text-lg tabular-nums">{summary.net.toLocaleString()}</div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">รายจ่ายตามหมวดหมู่</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-sm text-muted-foreground">กำลังโหลด...</div>
                    ) : summary.categoryData.length === 0 ? (
                        <div className="text-sm text-muted-foreground">ยังไม่มีข้อมูลรายจ่าย</div>
                    ) : (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={summary.categoryData}>
                                    <XAxis dataKey="category" tickLine={false} axisLine={false} />
                                    <YAxis tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="total" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
