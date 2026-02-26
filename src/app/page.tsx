'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { todayDDMMYYYY } from '@/lib/date';

type Expense = {
    date: string;
    item: string;
    type: string;
    amount: number;
    category: string;
    owner: string;
};

export default function HomePage() {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    const [item, setItem] = useState('');
    const [type, setType] = useState<'รายจ่าย' | 'รายรับ'>('รายจ่าย');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');

    async function load() {
        setLoading(true);
        try {
            const data = await fetch('/api/expenses').then((r) => r.json());
            setExpenses(data.expenses ?? []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    const categorySuggestions = useMemo(() => {
        const s = new Set<string>();
        for (const e of expenses) if (e.category) s.add(e.category);
        return Array.from(s).sort();
    }, [expenses]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const amt = Number(amount);
        if (!item.trim() || !category.trim() || !Number.isFinite(amt)) return;

        const body = {
            date: todayDDMMYYYY(),
            item: item.trim(),
            type,
            amount: amt,
            category: category.trim(),
            owner: 'JJ',
        };

        const res = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            setItem('');
            setCategory('');
            setAmount('');
            await load();
        }
    }

    return (
        <main className="mx-auto max-w-md p-6 space-y-8">
            {/* Header Section */}
            <div className="space-y-1 px-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">สวัสดี JJ</h2>
                <p className="text-muted-foreground text-sm">วันนี้คุณใช้จ่ายไปเท่าไหร่แล้ว?</p>
            </div>

            {/* Main Input Card - ปรับปรุงใหม่ให้โดดเด่น */}
            <section className="bg-card p-6 rounded-[2rem] shadow-sm border border-border/50 space-y-6">
                {/* Type Selector */}
                <div className="flex p-1 bg-muted/50 rounded-2xl">
                    {['รายจ่าย', 'รายรับ'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setType(t as any)}
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                                type === t
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Amount Input */}
                <div className="space-y-4">
                    <div className="flex items-baseline border-b border-border py-2 focus-within:border-primary transition-colors">
                        <span className="text-2xl font-medium text-muted-foreground mr-2">฿</span>
                        <input
                            inputMode="decimal"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="bg-transparent text-4xl font-mono font-bold focus:outline-none w-full placeholder:text-muted-foreground/50"
                        />
                    </div>

                    {/* Details Inputs */}
                    <div className="grid gap-4">
                        <div className="bg-muted/30 rounded-xl px-4 py-3 focus-within:ring-1 ring-primary transition-all">
                            <input
                                value={item}
                                onChange={(e) => setItem(e.target.value)}
                                placeholder="รายการ (เช่น กาแฟ)"
                                className="bg-transparent text-sm w-full outline-none placeholder:text-muted-foreground"
                            />
                        </div>
                        <div className="bg-muted/30 rounded-xl px-4 py-3 focus-within:ring-1 ring-primary transition-all">
                            <input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="หมวดหมู่ (เช่น อาหาร)"
                                list="category-suggest"
                                className="bg-transparent text-sm w-full outline-none placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <Button
                    onClick={onSubmit}
                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
                >
                    บันทึกรายการ
                </Button>
            </section>

            {/* Recent Items Section */}
            <div className="space-y-4 px-2">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    รายการล่าสุด <span className="text-xs font-normal text-muted-foreground">(วันนี้)</span>
                </h3>
                <div className="space-y-2.5">
                    {loading ? (
                        <div className="text-sm text-muted-foreground text-center py-4">กำลังโหลด...</div>
                    ) : expenses.length === 0 ? (
                        <div className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-2xl">
                            ยังไม่มีรายการวันนี้
                        </div>
                    ) : (
                        expenses
                            .slice(-5)
                            .reverse()
                            .map((e, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-4 bg-card border border-border/50 rounded-2xl shadow-sm transition-all hover:shadow-md hover:border-border"
                                >
                                    {/* (ส่วนแสดงรายการเหมือนเดิม) */}
                                    <div className="flex items-center gap-3.5">
                                        <div
                                            className={`w-1.5 h-10 rounded-full ${e.type === 'รายรับ' ? 'bg-primary' : 'bg-destructive'}`}
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{e.item}</p>
                                            <p className="text-[11px] text-muted-foreground font-medium">
                                                {e.category}
                                            </p>
                                        </div>
                                    </div>
                                    <p
                                        className={`font-mono text-base font-extrabold ${e.type === 'รายรับ' ? 'text-primary' : 'text-foreground'}`}
                                    >
                                        {e.type === 'รายรับ' ? '+' : ''}
                                        {Number(e.amount).toLocaleString()}
                                    </p>
                                </div>
                            ))
                    )}
                </div>
            </div>

            {/* Datalist (เหมือนเดิม) */}
            <datalist id="category-suggest">
                {categorySuggestions.map((c) => (
                    <option key={c} value={c} />
                ))}
            </datalist>
        </main>
    );
}
