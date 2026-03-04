'use client';

import { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Trash2, AlertCircle } from 'lucide-react';
import { formatMoney } from '@/lib/finance-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/user-context';

export function HistoryList({ expenses, loading, onDelete, onEdit }: any) {
    const [confirmingRow, setConfirmingRow] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { userName } = useUser();

    if (loading)
        return <div className="text-center py-20 animate-pulse font-bold text-muted-foreground">กำลังโหลด...</div>;
    if (expenses.length === 0) return <div className="text-center py-20 opacity-50 font-bold">ไม่พบรายการ</div>;

    return (
        <div className="space-y-4 pt-2 relative">
            <AnimatePresence>
                {expenses.map((e: any, i: number) => {
                    const isOpen = confirmingRow === e.rowIndex;
                    const isOwner = e.owner === userName;
                    const dragDistance = -90;

                    return (
                        <div key={e.rowIndex || i} className="relative group">
                            {isOwner && (
                                <div
                                    className="absolute right-0 top-1 bottom-1 bg-destructive flex items-center justify-center text-white"
                                    style={{ borderRadius: '2rem', width: '250px', paddingLeft: '11rem' }}
                                >
                                    <Trash2 size={20} />
                                </div>
                            )}

                            <motion.div
                                drag={isOwner ? 'x' : false}
                                dragConstraints={{ left: dragDistance, right: 0 }}
                                dragElastic={0.05}
                                animate={{ x: isOpen ? dragDistance : 0 }}
                                transition={{ type: 'spring', stiffness: 600, damping: 45 }}
                                onDragStart={() => setIsDragging(true)}
                                onDragEnd={(_, info) => {
                                    if (isOwner && info.offset.x < -40) {
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
                                className="relative z-10 flex items-center justify-between px-6 py-5 bg-white border border-border/10 rounded-[2rem] 
                          shadow-[0_8px_25px_rgba(0,0,0,0.05)] active:scale-[0.99] transition-all touch-pan-y"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`p-2 rounded-full ${e.type === 'รายรับ' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}
                                    >
                                        {e.type === 'รายรับ' ? (
                                            <ArrowUpCircle size={22} />
                                        ) : (
                                            <ArrowDownCircle size={22} />
                                        )}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-[15px] font-black text-slate-900 leading-tight truncate">
                                            {e.item}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/80 font-bold mt-1 tracking-tight">
                                            {e.date} • {e.category} • <span className="text-primary/70">{e.owner}</span>
                                        </p>
                                    </div>
                                </div>

                                <p
                                    className={`text-lg font-black tabular-nums ${e.type === 'รายรับ' ? 'text-emerald-600' : 'text-slate-900'}`}
                                >
                                    {e.type === 'รายรับ' ? '+' : ''}
                                    {formatMoney(Number(e.amount))}
                                </p>
                            </motion.div>
                        </div>
                    );
                })}
            </AnimatePresence>

            <AnimatePresence>
                {confirmingRow !== null && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-xs bg-white border border-border/40 shadow-2xl rounded-[3rem] p-8 text-center space-y-6"
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
                                    className="py-4 rounded-[1.5rem] bg-slate-100 font-black text-sm active:scale-95 transition-all"
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
