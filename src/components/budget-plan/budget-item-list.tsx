'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, PlusCircle, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { useUser } from '@/context/user-context';

export function BudgetItemList({
    section,
    items,
    onDelete,
    onEdit,
    onAdd,
    onTogglePaid,
    dailyExpenses,
    currentMonth,
}: any) {
    const { currentUserId, userName } = useUser();
    const [confirmingRow, setConfirmingRow] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const actualDailySpent = useMemo(() => {
        if (!dailyExpenses) return 0;

        const dailyItems = dailyExpenses.filter(
            (exp: any) =>
                exp.owner === userName &&
                exp.date.includes(currentMonth) &&
                exp.category !== 'น้ำมันรถ' &&
                exp.category !== 'ฟุ่มเฟือย' &&
                exp.category !== 'ของใช้ในบ้าน',
        );

        let expense = 0;
        dailyItems.forEach((item: any) => {
            if (item.type === 'รายจ่าย') expense += Number(item.amount);
        });
        return expense;
    }, [dailyExpenses, userName, currentMonth]);

    const actualFuelSpent = useMemo(() => {
        if (!dailyExpenses) return 0;
        return dailyExpenses
            .filter((exp: any) => exp.category === 'น้ำมันรถ')
            .reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);
    }, [dailyExpenses]);

    const actualLuxSpent = useMemo(() => {
        if (!dailyExpenses) return 0;
        return dailyExpenses
            .filter((exp: any) => exp.category === 'ฟุ่มเฟือย')
            .reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);
    }, [dailyExpenses]);

    const actualHouseSpent = useMemo(() => {
        if (!dailyExpenses) return 0;
        return dailyExpenses
            .filter((exp: any) => exp.category === 'ของใช้ในบ้าน')
            .reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);
    }, [dailyExpenses]);

    return (
        <div className="space-y-5 pt-2 px-4 relative overflow-visible">
            <div className="space-y-4">
                {items.map((plan: any) => {
                    const isPaid = section !== 'เงินเดือน' && plan.note?.includes('จ่ายแล้ว');
                    const isOpen = confirmingRow === plan.rowIndex;
                    const isOwner = String(plan.person_id) === String(currentUserId);
                    const swipeWidth = -100;

                    const isFuelItem = plan.item === 'ค่าน้ำมันพาหนะ';
                    const isLuxItem = plan.item === 'ฟุ่มเฟือย';
                    const isHouseItem = plan.item === 'ของใช้ในบ้าน';
                    const isDailyItem = plan.item === 'ค่าอาหารรายวัน' || plan.section === 'ค่าใช้จ่ายประจำเดือน';

                    const isTrackedItem = isFuelItem || isLuxItem || isDailyItem || isHouseItem;

                    const spent = isFuelItem
                        ? actualFuelSpent
                        : isLuxItem
                          ? actualLuxSpent
                          : isHouseItem
                            ? actualHouseSpent
                            : actualDailySpent;

                    const isOverBudget = spent > Number(plan.amount);

                    return (
                        <div key={plan.rowIndex} className="relative group overflow-visible">
                            {isOwner && !isPaid && (
                                <div
                                    className="absolute right-0 top-1 bottom-1 bg-destructive flex items-center justify-center text-white"
                                    style={{ borderRadius: '2rem', width: '250px', paddingLeft: '11rem' }}
                                >
                                    <Trash2 size={20} />
                                </div>
                            )}

                            <motion.div
                                drag={!isOwner || isPaid ? false : 'x'}
                                dragConstraints={{ left: swipeWidth, right: 0 }}
                                dragElastic={0.05}
                                animate={{ x: isOpen ? swipeWidth : 0 }}
                                transition={{ type: 'spring', stiffness: 600, damping: 45 }}
                                onDragStart={() => setIsDragging(true)}
                                onDragEnd={(_, info) => {
                                    if (isOwner && info.offset.x < -40) {
                                        setConfirmingRow(plan.rowIndex);
                                    } else {
                                        setConfirmingRow(null);
                                    }
                                    setTimeout(() => setIsDragging(false), 100);
                                }}
                                onTap={(event: any) => {
                                    if (event.target.closest('.paid-btn')) return;

                                    if (!isDragging && !isOpen && !isPaid) {
                                        if (isOwner) {
                                            onEdit(plan);
                                        } else {
                                        }
                                    } else if (isOpen) {
                                        setConfirmingRow(null);
                                    }
                                }}
                                className={`relative z-10 flex items-center justify-between p-5 bg-white border border-border/10 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-all touch-pan-y ${isPaid ? 'opacity-60' : 'opacity-100 cursor-pointer'}`}
                            >
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    {section !== 'เงินเดือน' && !isTrackedItem && (
                                        <button className="paid-btn shrink-0" onClick={() => onTogglePaid(plan)}>
                                            {isPaid ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                        </button>
                                    )}

                                    <div className="min-w-0">
                                        <p className="text-[15px] font-black text-slate-900 truncate">{plan.item}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold">{plan.date}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0 text-right">
                                    <div className="flex items-baseline gap-1.5">
                                        {isTrackedItem && (
                                            <>
                                                <span
                                                    className={`font-sans text-base font-bold ${isOverBudget ? 'text-red-500' : 'text-emerald-600'}`}
                                                >
                                                    ฿{spent.toLocaleString()}
                                                </span>
                                                <span className="text-slate-300 font-bold font-sans text-base">/</span>
                                            </>
                                        )}
                                        <p
                                            className={`font-sans text-base font-black ${isPaid ? 'text-emerald-600' : 'text-slate-900'}`}
                                        >
                                            ฿{plan.amount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={() => onAdd(section)}
                className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center bg-slate-50/50 text-slate-400 active:scale-[0.98] transition-all mt-4 shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
            >
                <PlusCircle size={24} className="mb-1" />
                <span className="text-xs font-black uppercase tracking-wider">เพิ่มรายการใน {section}</span>
            </button>

            <AnimatePresence>
                {confirmingRow !== null && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-xs bg-white border border-border/40 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[3rem] p-8 text-center space-y-6"
                        >
                            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                                <AlertCircle size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-slate-900">ยืนยันการลบ?</h3>
                                <p className="text-sm text-muted-foreground font-bold">
                                    รายการนี้จะหายไปจากประวัติของคุณ
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setConfirmingRow(null)}
                                    className="py-4 rounded-[1.5rem] bg-slate-100 font-black text-slate-900 text-sm active:scale-95 transition-all"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={() => {
                                        onDelete(confirmingRow);
                                        setConfirmingRow(null);
                                    }}
                                    className="py-4 rounded-[1.5rem] bg-red-600 text-white font-black text-sm active:scale-95 transition-all shadow-lg shadow-red-200"
                                >
                                    ลบรายการ
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
