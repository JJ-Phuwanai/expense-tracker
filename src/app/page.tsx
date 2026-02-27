'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { todayDDMMYYYY } from '@/lib/date';
import { CategoryDropdown } from '@/components/ui/category-dropdown';
import { TodayExpensesList } from '@/components/today-expenses-list';
import { Wallet, PlusCircle } from 'lucide-react';

export default function HomePage() {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState<any[]>([]);

    const [item, setItem] = useState('');
    const [type, setType] = useState<'รายจ่าย' | 'รายรับ'>('รายจ่าย');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');

    async function loadData() {
        setLoading(true);
        const res = await fetch('/api/expenses').then((r) => r.json());
        setExpenses(res.expenses ?? []);
        setLoading(false);
    }

    useEffect(() => {
        loadData();
    }, []);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!item.trim() || !category || !amount) return;

        const body = {
            date: todayDDMMYYYY(),
            item: item.trim(),
            type,
            amount: Number(amount),
            category,
            owner: 'JJ',
        };

        const res = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            setItem('');
            setCategory('');
            setAmount('');
            loadData();
        }
    }

    const netToday = useMemo(() => {
        const today = todayDDMMYYYY();
        const dayItems = expenses.filter((e) => e.date === today);

        const income = dayItems.filter((e) => e.type === 'รายรับ').reduce((sum, e) => sum + Number(e.amount), 0);

        const expense = dayItems.filter((e) => e.type === 'รายจ่าย').reduce((sum, e) => sum + Number(e.amount), 0);

        return income - expense;
    }, [expenses]);

    return (
        <main className="h-screen max-w-md mx-auto flex flex-col overflow-hidden bg-muted/40 font-sans">
            {/* --- 1. ส่วนหัวล็อคอยู่กับที่ (Fixed Header) --- */}
            <div className="flex-none p-6 pb-4 bg-muted/40 backdrop-blur-md">
                <div className="flex justify-between items-start px-1">
                    <div className="space-y-0.5">
                        <h2 className="text-2xl font-black tracking-tight text-foreground">สวัสดี JJ</h2>
                        <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
                            วันนี้คุณใช้จ่ายไปเท่าไหร่แล้ว?
                        </p>
                    </div>

                    {/* ยอดสรุปสุทธิรายวัน */}
                    <div className="text-right">
                        {netToday <= 0 && (
                            <span className="text-[9px] text-muted-foreground font-bold uppercase block leading-none mb-1">
                                รวมค่าใช้จ่าย
                            </span>
                        )}
                        <span
                            className={`text-xl font-black tabular-nums leading-none ${
                                netToday > 0 ? 'text-primary' : 'text-destructive'
                            }`}
                        >
                            {netToday > 0 ? `+${netToday.toLocaleString()}` : `${Math.abs(netToday).toLocaleString()}`}
                            <span className="text-[10px] font-bold ml-1 text-muted-foreground">บาท</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* --- 2. ส่วนที่เลื่อนได้ (Scrollable Content) --- */}
            <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-7">
                {/* ฟอร์มบันทึกข้อมูล */}
                <section className="bg-card p-6 rounded-[2.5rem] shadow-sm border border-border/40 space-y-5 mt-1">
                    <div className="flex p-1 bg-muted/50 rounded-2xl border border-border/10">
                        {['รายจ่าย', 'รายรับ'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t as any)}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                                    type === t
                                        ? 'bg-background shadow-sm text-foreground scale-[1.02]'
                                        : 'text-muted-foreground opacity-50'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-baseline border-b border-border py-1 focus-within:border-primary transition-colors">
                            <span className="text-2xl font-medium text-muted-foreground mr-2">฿</span>
                            <input
                                inputMode="decimal"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="bg-transparent text-4xl font-mono font-bold focus:outline-none w-full placeholder:text-muted-foreground/10"
                            />
                        </div>

                        <div className="grid gap-3">
                            <div className="bg-muted/30 rounded-xl px-4 py-3.5">
                                <input
                                    value={item}
                                    onChange={(e) => setItem(e.target.value)}
                                    placeholder="รายการ..."
                                    className="bg-transparent text-sm w-full outline-none font-medium"
                                />
                            </div>
                            <CategoryDropdown value={category} onChange={setCategory} />
                        </div>
                    </div>

                    <Button
                        onClick={onSubmit}
                        className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
                    >
                        <PlusCircle className="mr-2 h-5 w-5" /> บันทึกรายการ
                    </Button>
                </section>

                {/* ส่วนลิสต์รายการ */}
                <div className="space-y-4">
                    <div className="px-1 flex items-center gap-2">
                        <Wallet size={16} className="text-muted-foreground" />
                        <h3 className="text-sm font-black text-foreground">
                            รายการล่าสุด <span className="text-xs font-normal text-muted-foreground">(วันนี้)</span>
                        </h3>
                    </div>

                    <TodayExpensesList expenses={expenses} loading={loading} />
                </div>
            </div>
        </main>
    );
}
