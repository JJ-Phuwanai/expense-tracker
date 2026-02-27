'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChevronLeft, TrendingUp, Wallet, ReceiptText } from 'lucide-react';

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [lines, setLines] = useState<any[]>([]);

    const loadData = async () => {
        setLoading(true);
        const res = await fetch('/api/budget-lines').then((r) => r.json());
        setLines(res.lines ?? []);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // คำนวณสรุปผลตาม Logic JJ
    const summary = useMemo(() => {
        let income = 0;
        let expense = 0;
        const bySection: Record<string, number> = {};

        lines.forEach((line) => {
            const amt = line.amount || 0;
            if (line.section === 'income') {
                income += amt;
            } else {
                expense += amt;
                bySection[line.section] = (bySection[line.section] || 0) + amt;
            }
        });

        const chartData = Object.entries(bySection).map(([name, value]) => ({ name, value }));
        return { income, expense, net: income - expense, chartData };
    }, [lines]);

    return (
        <main className="h-screen max-w-md mx-auto flex flex-col bg-muted/40 font-sans overflow-hidden">
            {/* --- Header ตามสไตล์ JJ --- */}
            <div className="p-6 pt-8 bg-muted/40 backdrop-blur-md">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black tracking-tighter text-foreground">สวัสดี JJ</h2>
                        <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
                            วิเคราะห์งบประมาณ
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-[9px] text-muted-foreground font-bold uppercase block mb-1">
                            คงเหลือสุทธิ
                        </span>
                        <span className="text-xl font-black text-emerald-600 tabular-nums leading-none">
                            ฿{summary.net.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-20 space-y-6 scrollbar-hide">
                {/* --- Summary Cards 3 ช่อง --- */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-card p-4 rounded-[1.5rem] border border-border/40 shadow-sm text-center">
                        <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">รายรับ</p>
                        <p className="text-sm font-black text-emerald-600">฿{summary.income.toLocaleString()}</p>
                    </div>
                    <div className="bg-card p-4 rounded-[1.5rem] border border-border/40 shadow-sm text-center">
                        <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">รายจ่าย</p>
                        <p className="text-sm font-black text-destructive">฿{summary.expense.toLocaleString()}</p>
                    </div>
                    <div className="bg-card p-4 rounded-[1.5rem] border border-border/40 shadow-sm text-center flex flex-col justify-center items-center">
                        <TrendingUp size={14} className="text-primary mb-1" />
                        <p className="text-[9px] font-black text-primary uppercase">Analytics</p>
                    </div>
                </div>

                {/* --- กราฟแท่งสี Pastel --- */}
                <Card className="rounded-[2.5rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden bg-card">
                    <div className="p-6 pb-2">
                        <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
                            สัดส่วนค่าใช้จ่าย
                        </h3>
                    </div>
                    <div className="h-64 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary.chartData}>
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        borderRadius: '1rem',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    }}
                                />
                                <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={40}>
                                    {summary.chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index % 2 === 0 ? '#3b82f6' : '#f43f5e'}
                                            fillOpacity={0.8}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* --- รายการจาก Budget_lines --- */}
                <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">
                        รายการงบประมาณล่าสุด
                    </h3>
                    {lines.map((line) => (
                        <div
                            key={line.rowIndex}
                            className="flex items-center justify-between p-4 bg-card rounded-[1.5rem] border border-border/20 shadow-sm active:scale-95 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`p-2 rounded-xl ${line.section === 'income' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}
                                >
                                    {line.section === 'income' ? <Wallet size={16} /> : <ReceiptText size={16} />}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-foreground leading-tight">{line.item}</p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase">
                                        {line.section}
                                    </p>
                                </div>
                            </div>
                            <p
                                className={`text-sm font-black ${line.section === 'income' ? 'text-emerald-600' : 'text-foreground'}`}
                            >
                                ฿{line.amount.toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
