'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { todayDDMMYYYY } from '@/lib/date';
import { CategoryDropdown } from '@/components/ui/category-dropdown';
import { TodayExpensesList } from '@/components/today-expenses-list';
import { useUser } from '@/context/user-context';
import { EditPopup } from '@/components/budget-home/home-list-edit';
import { Plus, Loader2, CheckCircle2, XCircle, Wallet, PlusCircle, ChevronDown } from 'lucide-react';
import { scanSlip } from '@/lib/ocr-helper';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingScreen from './loading';

export default function HomePage() {
    const { currentUserId, userName, users, switchUser } = useUser();
    const [showPicker, setShowPicker] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState<any[]>([]);

    const [item, setItem] = useState('');
    const [type, setType] = useState<'รายจ่าย' | 'รายรับ'>('รายจ่าย');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [editingExpense, setEditingExpense] = useState<any>(null);

    const [uploadStatus, setUploadStatus] = useState<'idle' | 'scanning' | 'saving' | 'success' | 'error'>('idle');
    const [statusMsg, setStatusMsg] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/expenses?personId=${currentUserId}`, {
                cache: 'no-store',
            });
            const data = await res.json();
            setExpenses(data.expenses ?? []);
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!item.trim() || !category || !amount) return;

        const body = {
            date: todayDDMMYYYY(),
            item: item.trim(),
            type,
            amount: Number(amount),
            category,
            owner: userName,
            person_id: currentUserId,
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

    const handleDelete = async (rowIndex: number) => {
        try {
            const res = await fetch('/api/expenses', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rowIndex }),
            });

            if (res.ok) {
                loadData();
            }
        } catch (error) {
            console.error('Delete failed', error);
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
            loadData();
        }
    };

    const netToday = useMemo(() => {
        const today = todayDDMMYYYY();
        const dayItems = expenses.filter((e) => e.date === today && e.owner === userName);

        const income = dayItems.filter((e) => e.type === 'รายรับ').reduce((sum, e) => sum + Number(e.amount), 0);

        const expense = dayItems.filter((e) => e.type === 'รายจ่าย').reduce((sum, e) => sum + Number(e.amount), 0);

        return income - expense;
    }, [expenses, userName]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadStatus('scanning');
            setStatusMsg('กำลังอ่านข้อมูลสลิป...');

            const result = await scanSlip(file);

            if (!result || result.amount == null || result.amount <= 0) {
                setUploadStatus('error');
                setStatusMsg('ไม่พบข้อมูลยอดเงินในสลิป');
                setTimeout(() => setUploadStatus('idle'), 2000);
                return;
            }

            setUploadStatus('saving');
            setStatusMsg(`ตรวจพบ ฿${result.amount} กำลังบันทึก...`);

            const expenseDate = result.formattedDate || todayDDMMYYYY();

            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: result.amount,
                    item: result.itemName || 'รายการจากสลิป',
                    category: 'ค่าใช้จ่ายประจำเดือน',
                    type: 'รายจ่าย',
                    date: expenseDate,
                    owner: userName,
                    person_id: currentUserId,
                }),
            });

            if (!res.ok) {
                setUploadStatus('error');
                setStatusMsg('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
                setTimeout(() => setUploadStatus('idle'), 2000);
                return;
            }

            setUploadStatus('success');
            setStatusMsg('บันทึกข้อมูลเรียบร้อย!');
            await loadData();

            setTimeout(() => setUploadStatus('idle'), 1500);
        } catch (error) {
            console.error('handleFileSelect error:', error);
            setUploadStatus('error');
            setStatusMsg('อ่านสลิปไม่สำเร็จ');
            setTimeout(() => setUploadStatus('idle'), 2000);
        } finally {
            e.target.value = '';
        }
    };

    if (loading && expenses.length === 0) {
        return <LoadingScreen />;
    }

    return (
        <>
            <AnimatePresence mode="wait">
                {loading && expenses.length === 0 && <LoadingScreen key="loader" />}
            </AnimatePresence>
            <main className="h-screen max-w-md mx-auto flex flex-col overflow-hidden bg-muted/40 font-sans">
                <div className="flex-none p-6 pb-4 bg-muted/40 backdrop-blur-md relative z-50">
                    <div className="flex justify-between items-start px-1">
                        <div className="space-y-0.5 relative">
                            <button
                                onClick={() => setShowPicker(!showPicker)}
                                className="flex items-center gap-1 group active:scale-95 transition-all outline-none"
                            >
                                <h2 className="text-2xl font-black tracking-tight text-foreground">
                                    สวัสดี {userName}
                                </h2>
                                <ChevronDown
                                    size={18}
                                    className={`text-muted-foreground transition-transform ${showPicker ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {showPicker && (
                                <div className="absolute top-full left-0 mt-2 w-40 bg-card border border-border/40 rounded-2xl shadow-xl p-2 z-[100] animate-in zoom-in-95 duration-200">
                                    {users.map((u: any) => (
                                        <button
                                            key={u.id}
                                            onClick={() => {
                                                switchUser(u.id);
                                                setShowPicker(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm font-bold rounded-xl hover:bg-muted active:bg-primary/10 transition-colors"
                                        >
                                            {u.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest ml-1">
                                วันนี้คุณใช้จ่ายไปเท่าไหร่แล้ว?
                            </p>
                        </div>

                        <div className="text-right">
                            <span className="text-[9px] text-muted-foreground font-bold uppercase block leading-none mb-1">
                                {netToday >= 0 ? 'ยอดคงเหลือวันนี้' : 'รวมค่าใช้จ่ายวันนี้'}
                            </span>
                            <span
                                className={`text-xl font-black tabular-nums leading-none ${netToday >= 0 ? 'text-emerald-600' : 'text-destructive'}`}
                            >
                                ฿{Math.abs(netToday).toLocaleString()}
                                <span className="text-[10px] font-bold ml-1 text-muted-foreground">บาท</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-7 scrollbar-hide">
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
                            <div
                                className={`flex items-baseline border-b py-1 transition-colors ${type === 'รายรับ' ? 'border-emerald-500/30' : 'border-destructive/30'}`}
                            >
                                <span
                                    className={`text-2xl font-medium mr-2 ${type === 'รายรับ' ? 'text-emerald-600' : 'text-destructive'}`}
                                >
                                    ฿
                                </span>
                                <input
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className={`bg-transparent text-4xl font-mono font-bold focus:outline-none w-full placeholder:text-muted-foreground/10 ${type === 'รายรับ' ? 'text-emerald-600' : 'text-foreground'}`}
                                />
                            </div>

                            <div className="grid gap-3">
                                <div className="bg-muted/30 rounded-xl px-4 py-3.5">
                                    <input
                                        value={item}
                                        onChange={(e) => setItem(e.target.value)}
                                        placeholder="วันนี้ซื้ออะไรไป"
                                        className="bg-transparent text-sm w-full outline-none font-medium"
                                    />
                                </div>
                                <CategoryDropdown value={category} onChange={setCategory} />
                            </div>
                        </div>

                        <Button
                            onClick={onSubmit}
                            className={`w-full h-14 rounded-2xl text-lg font-bold shadow-lg transition-all active:scale-[0.98] ${
                                type === 'รายรับ'
                                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10'
                                    : 'bg-primary hover:bg-primary/90 shadow-primary/10'
                            }`}
                        >
                            <PlusCircle className="mr-2 h-5 w-5" /> บันทึก{type}
                        </Button>
                    </section>

                    <div className="space-y-4">
                        <div className="px-1 flex items-center gap-2">
                            <Wallet size={16} className="text-muted-foreground" />
                            <h3 className="text-sm font-black text-foreground">
                                รายการล่าสุด <span className="text-xs font-normal text-muted-foreground">(วันนี้)</span>
                            </h3>
                        </div>
                        <TodayExpensesList
                            expenses={expenses}
                            loading={loading}
                            onDelete={handleDelete}
                            onEdit={(e: any) => setEditingExpense(e)}
                        />
                    </div>
                </div>

                <div className="fixed bottom-23 right-2 z-[60]">
                    <label className="flex items-center justify-center w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl cursor-pointer transition-all active:scale-90">
                        <Plus size={28} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                    </label>
                </div>

                <AnimatePresence>
                    {uploadStatus !== 'idle' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/20 backdrop-blur-sm p-10"
                        >
                            <div className="bg-card p-8 rounded-[2.5rem] shadow-2xl border border-border/50 flex flex-col items-center space-y-4 min-w-[240px]">
                                {(uploadStatus === 'scanning' || uploadStatus === 'saving') && (
                                    <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                                )}
                                {uploadStatus === 'success' && (
                                    <div className="bg-emerald-100 p-4 rounded-full">
                                        <CheckCircle2 className="w-16 h-16 text-emerald-600" />
                                    </div>
                                )}
                                {uploadStatus === 'error' && (
                                    <div className="bg-destructive/10 p-4 rounded-full">
                                        <XCircle className="w-16 h-16 text-destructive" />
                                    </div>
                                )}

                                <p className="text-lg font-black text-center">{statusMsg}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {editingExpense && (
                        <EditPopup
                            expense={editingExpense}
                            onClose={() => setEditingExpense(null)}
                            onSave={handleUpdate}
                        />
                    )}
                </AnimatePresence>
            </main>
        </>
    );
}
