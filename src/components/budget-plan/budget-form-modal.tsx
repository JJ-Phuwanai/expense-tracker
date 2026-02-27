'use client';

import { useEffect, useState } from 'react';
import { X, Save, PlusCircle, Plus, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BudgetFormModal({
    isOpen,
    editingRow,
    formData,
    setFormData,
    selectedSection,
    onClose,
    onRefresh,
}: any) {
    const [sections, setSections] = useState<string[]>([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newSection, setNewSection] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchSections();
        }
    }, [isOpen]);

    const fetchSections = async () => {
        try {
            const res = await fetch('/api/settings/desc/sec');
            const data = await res.json();
            setSections(data.categories || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddNewSection = async () => {
        if (!newSection.trim()) return;
        try {
            const res = await fetch('/api/settings/desc/sec', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: newSection.trim() }),
            });
            if (res.ok) {
                await fetchSections();
                setFormData({ ...formData, section: newSection.trim() });
                setIsAddingNew(false);
                setNewSection('');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!isOpen) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingRow !== null ? 'PATCH' : 'POST';
        const body = { rowIndex: editingRow, ...formData, amount: Number(formData.amount) };
        const res = await fetch('/api/budget-plan', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            onClose();
            onRefresh();
        }
    };

    return (
        <div className="absolute inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="w-full bg-card rounded-t-[2.5rem] p-6 pb-8 shadow-2xl border-t border-white/10 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-hidden">
                <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4 opacity-40" />

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black tracking-tighter text-foreground">
                        {editingRow ? 'แก้ไขแผนงาน' : 'เพิ่มรายการใหม่'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 bg-muted rounded-full active:scale-90 transition-transform"
                    >
                        <X size={18} strokeWidth={3} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4 font-sans">
                    {!selectedSection || editingRow ? (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted-foreground ml-2 uppercase tracking-widest">
                                กลุ่มงบประมาณ
                            </label>

                            <div className="flex gap-2">
                                {isAddingNew ? (
                                    <div className="flex-1 flex gap-2 animate-in zoom-in-95 duration-200">
                                        <input
                                            value={newSection}
                                            onChange={(e) => setNewSection(e.target.value)}
                                            placeholder="ระบุชื่อกลุ่มใหม่..."
                                            className="flex-1 h-12 rounded-xl bg-primary/5 border-2 border-primary/20 text-sm px-4 outline-none font-bold text-foreground placeholder:text-primary/30"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddNewSection}
                                            className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingNew(false)}
                                            className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center active:scale-90 transition-all"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex gap-2">
                                        <div className="relative flex-1 group">
                                            <select
                                                value={formData.section}
                                                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                                className="w-full h-12 rounded-xl bg-muted/40 border-none text-sm px-5 outline-none font-bold appearance-none text-foreground transition-all focus:ring-2 ring-primary/20"
                                                required
                                            >
                                                <option value="">เลือกกลุ่ม...</option>
                                                {sections.map((sec) => (
                                                    <option key={sec} value={sec}>
                                                        {sec}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown
                                                size={16}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:rotate-180 transition-transform"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingNew(true)}
                                            className="w-12 h-12 bg-muted/40 text-muted-foreground rounded-xl flex items-center justify-center hover:bg-primary/10 hover:text-primary active:scale-90 transition-all border border-dashed border-border/60"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-muted/20 px-5 py-3 rounded-2xl flex justify-between items-center border border-border/10">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                                หมวด: {formData.section}
                            </span>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                                รอบ: {formData.date}
                            </span>
                        </div>
                    )}

                    <div className="space-y-3 pt-1">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-muted-foreground ml-2 uppercase">
                                ชื่อรายการ
                            </label>
                            <input
                                value={formData.item}
                                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                                placeholder="เช่น ค่าหอพัก, ประกันสังคม..."
                                className="w-full h-12 rounded-xl bg-muted/40 border-none text-sm px-5 outline-none font-bold text-foreground shadow-inner"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-muted-foreground ml-2 uppercase">
                                จำนวนเงิน
                            </label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                className="w-full h-12 rounded-xl bg-muted/40 border-none text-sm px-5 outline-none font-bold text-foreground shadow-inner"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 rounded-2xl font-black text-base shadow-xl mt-4 active:scale-[0.98] transition-all bg-primary text-primary-foreground"
                    >
                        {editingRow ? <Save className="mr-2" size={18} /> : <PlusCircle className="mr-2" size={18} />}
                        {editingRow ? 'อัปเดตแผนงาน' : 'บันทึกแผนงาน'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
