'use client';

import { CreditCard, ReceiptText, CalendarDays } from 'lucide-react';

export function AnalyticsList({ selectedMonth, plans, combinedDaily }: any) {
    const paidPlans = plans.filter(
        (l: any) => l.note === 'จ่ายแล้ว' && l.section !== 'เงินเดือน' && l.date === selectedMonth,
    );

    return (
        <div className="space-y-3 pb-10">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2 flex items-center gap-2">
                <CalendarDays size={14} /> รายการเดือน {selectedMonth}
            </h3>

            {combinedDaily > 0 && (
                <div className="flex items-center justify-between p-5 bg-primary/5 rounded-[2rem] border border-primary/10 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <CreditCard size={16} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 leading-tight">ค่าใช้จ่ายผันแปร</p>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">
                                รวม: น้ำมัน, ฟุ่มเฟือย, รายวัน
                            </p>
                        </div>
                    </div>
                    <p className="text-sm font-black tabular-nums text-slate-900">฿{combinedDaily.toLocaleString()}</p>
                </div>
            )}

            {paidPlans.map((line: any) => (
                <div
                    key={line.rowIndex}
                    className="flex items-center justify-between p-5 bg-white rounded-[2rem] border border-border/10 shadow-sm transition-all active:scale-[0.98]"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-50 text-slate-400">
                            <ReceiptText size={16} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-slate-900 leading-tight truncate">{line.item}</p>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">
                                {line.section}
                            </p>
                        </div>
                    </div>
                    <p className="text-sm font-black tabular-nums text-slate-900">฿{line.amount.toLocaleString()}</p>
                </div>
            ))}

            {paidPlans.length === 0 && combinedDaily === 0 && (
                <div className="py-10 text-center opacity-40 font-bold text-xs uppercase">
                    ไม่พบรายการที่มีการชำระเงิน
                </div>
            )}
        </div>
    );
}
