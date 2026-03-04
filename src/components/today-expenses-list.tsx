'use client';

import { useMemo, useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Trash2, AlertCircle } from 'lucide-react';
import { todayDDMMYYYY } from '@/lib/date';
import { useUser } from '@/context/user-context';
import { motion, AnimatePresence } from 'framer-motion';

interface TodayExpensesListProps {
    expenses: any[];
    loading: boolean;
    onDelete: (rowIndex: number) => void;
    onEdit: (expense: any) => void;
}

export function TodayExpensesList({ expenses, loading, onDelete, onEdit }: TodayExpensesListProps) {
    const { userName } = useUser();
    const [confirmingRow, setConfirmingRow] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const todayExpenses = useMemo(() => {
        const today = todayDDMMYYYY();
        return expenses.filter((e) => e.date === today && e.owner === userName);
    }, [expenses, userName]);

    if (loading) return <div className="text-center py-10 animate-pulse">กำลังโหลด...</div>;
    if (todayExpenses.length === 0) return <div className="text-center py-12 opacity-50">ยังไม่มีรายการวันนี้</div>;

    return (
        <div className="space-y-3 overflow-hidden relative">
            <AnimatePresence>
                {todayExpenses.map((e, i) => {
                    const isOpen = confirmingRow === e.rowIndex;
                    const isOwner = e.owner === userName;
                    const swipeDistance = -90;

                    return (
                        <div key={e.rowIndex || i} className="relative overflow-hidden rounded-2xl">
                            <div
                                className="absolute right-0 top-1 bottom-1 w-[250px] bg-destructive pl-45 flex items-center justify-center text-white"
                                style={{ borderRadius: 'inherit' }}
                            >
                                <Trash2 size={20} />
                            </div>

                            <motion.div
                                drag="x"
                                dragConstraints={{ left: swipeDistance, right: 0 }}
                                dragElastic={0.05}
                                animate={{ x: isOpen ? swipeDistance : 0 }}
                                transition={{ type: 'spring', stiffness: 600, damping: 45 }}
                                onDragStart={() => setIsDragging(true)}
                                onDragEnd={(_, info) => {
                                    if (info.offset.x < -40) {
                                        setConfirmingRow(e.rowIndex);
                                    } else {
                                        setConfirmingRow(null);
                                    }
                                    setTimeout(() => setIsDragging(false), 100);
                                }}
                                onTap={() => {
                                    if (!isDragging && !isOpen && isOwner) {
                                        onEdit(e);
                                    } else if (isOpen) {
                                        setConfirmingRow(null);
                                    }
                                }}
                                className="relative z-10 flex items-center justify-between p-4 bg-card border border-border/40 rounded-2xl shadow-sm transition-all active:scale-[0.98] touch-pan-y"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div
                                        className={`p-2 rounded-full ${e.type === 'รายรับ' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}
                                    >
                                        {e.type === 'รายรับ' ? (
                                            <ArrowUpCircle size={20} />
                                        ) : (
                                            <ArrowDownCircle size={20} />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold truncate">{e.item}</p>
                                        <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                                            {e.category} • {e.owner}
                                        </p>
                                    </div>
                                </div>
                                <p
                                    className={`font-mono text-base font-extrabold ${e.type === 'รายรับ' ? 'text-primary' : 'text-destructive'}`}
                                >
                                    {e.type === 'รายรับ' ? '+' : '-'}
                                    {Number(e.amount).toLocaleString()}
                                </p>
                            </motion.div>
                        </div>
                    );
                })}
            </AnimatePresence>

            <AnimatePresence>
                {confirmingRow !== null && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-background/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-xs bg-card border border-border shadow-2xl rounded-[2.5rem] p-8 text-center space-y-6"
                        >
                            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
                                <AlertCircle size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black">ยืนยันการลบ?</h3>
                                <p className="text-sm text-muted-foreground font-medium">
                                    รายการนี้จะถูกลบออกจากระบบทันที
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setConfirmingRow(null)}
                                    className="py-3 rounded-2xl bg-muted font-bold text-sm active:scale-95 transition-all"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={() => {
                                        onDelete(confirmingRow);
                                        setConfirmingRow(null);
                                    }}
                                    className="py-3 rounded-2xl bg-destructive text-white font-bold text-sm active:scale-95 transition-all shadow-lg shadow-destructive/20"
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
