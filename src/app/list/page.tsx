'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { parseDDMMYYYY } from '@/lib/date';

type Expense = {
    date: string;
    item: string;
    type: string;
    amount: number;
    category: string;
    owner: string;
};

type SortKey = 'date' | 'category' | 'item';

export default function ListPage() {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [sortKey, setSortKey] = useState<SortKey>('date');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

    async function load() {
        setLoading(true);
        const data = await fetch('/api/expenses').then((r) => r.json());
        setExpenses(data.expenses ?? []);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, []);

    const sorted = useMemo(() => {
        const arr = [...expenses];
        arr.sort((a, b) => {
            let av: any = '';
            let bv: any = '';

            if (sortKey === 'date') {
                av = parseDDMMYYYY(a.date);
                bv = parseDDMMYYYY(b.date);
            } else if (sortKey === 'category') {
                av = (a.category ?? '').toLowerCase();
                bv = (b.category ?? '').toLowerCase();
            } else {
                av = (a.item ?? '').toLowerCase();
                bv = (b.item ?? '').toLowerCase();
            }

            if (av < bv) return sortDir === 'asc' ? -1 : 1;
            if (av > bv) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return arr;
    }, [expenses, sortKey, sortDir]);

    return (
        <main className="mx-auto max-w-4xl p-6 space-y-6">
            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-base">รายการทั้งหมด</CardTitle>

                    <div className="flex gap-2">
                        <select
                            className="h-9 rounded-md border bg-background px-3 text-sm"
                            value={sortKey}
                            onChange={(e) => setSortKey(e.target.value as SortKey)}
                        >
                            <option value="date">เรียงตามวันที่</option>
                            <option value="category">เรียงตามหมวดหมู่</option>
                            <option value="item">เรียงตามชื่อรายการ</option>
                        </select>

                        <select
                            className="h-9 rounded-md border bg-background px-3 text-sm"
                            value={sortDir}
                            onChange={(e) => setSortDir(e.target.value as any)}
                        >
                            <option value="desc">มาก → น้อย / ล่าสุด</option>
                            <option value="asc">น้อย → มาก / เก่าสุด</option>
                        </select>
                    </div>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="text-sm text-muted-foreground">กำลังโหลด...</div>
                    ) : sorted.length === 0 ? (
                        <div className="text-sm text-muted-foreground">ยังไม่มีรายการ</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-muted-foreground">
                                        <th className="py-2 text-left">วันที่</th>
                                        <th className="py-2 text-left">รายการ</th>
                                        <th className="py-2 text-left">ประเภท</th>
                                        <th className="py-2 text-left">หมวดหมู่</th>
                                        <th className="py-2 text-right">จำนวนเงิน</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sorted.map((e, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="py-2">{e.date}</td>
                                            <td className="py-2">{e.item}</td>
                                            <td className="py-2">{e.type}</td>
                                            <td className="py-2">{e.category}</td>
                                            <td className="py-2 text-right tabular-nums">
                                                {Number(e.amount).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
