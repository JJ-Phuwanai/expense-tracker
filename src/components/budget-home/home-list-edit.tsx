import { motion } from 'framer-motion';
import { useState } from 'react';
import { CategoryDropdown } from '../ui/category-dropdown';

export function EditPopup({
    expense,
    onClose,
    onSave,
}: {
    expense: any;
    onClose: () => void;
    onSave: (data: any) => void;
}) {
    const [item, setItem] = useState(expense.item);
    const [category, setCategory] = useState(expense.category);
    const [amount, setAmount] = useState(expense.amount);

    return (
        <div className="fixed inset-0 z-[49] flex items-center justify-center p-6 bg-background/10 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-sm bg-card border border-border shadow-2xl rounded-[2.5rem] p-8 space-y-6"
            >
                <div className="text-center">
                    <h3 className="text-xl font-black">แก้ไขรายการ</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">โดย {expense.owner}</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase ml-1 opacity-60">ชื่อรายการ</label>
                        <input
                            value={item}
                            onChange={(e) => setItem(e.target.value)}
                            className="w-full p-4 bg-muted/50 rounded-2xl font-bold outline-none focus:ring-2 ring-primary/20"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase ml-1 opacity-60">จำนวนเงิน (฿)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full p-4 bg-muted/50 rounded-2xl font-mono font-bold outline-none"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase ml-1 opacity-60">หมวดหมู่</label>
                        <CategoryDropdown value={category} onChange={setCategory} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="py-4 rounded-2xl bg-muted font-black text-sm active:scale-95 transition-all"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={() => onSave({ ...expense, item, category, amount })}
                        className="py-4 rounded-2xl bg-primary text-white font-black text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all"
                    >
                        บันทึก
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
