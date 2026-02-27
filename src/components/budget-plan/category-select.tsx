'use client';

import { useState } from 'react';
import { Search, Plus, Check, ChevronDown } from 'lucide-react';

export function CategorySelect({ value, onChange, categories, onAdd }: any) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = categories.filter((c: string) => c.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-12 rounded-xl bg-muted/40 flex items-center justify-between px-5 font-bold text-sm transition-all focus:ring-2 ring-primary/20"
            >
                <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
                    {value || 'เลือกกลุ่มงบประมาณ...'}
                </span>
                <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border/50 shadow-2xl rounded-[1.5rem] z-[110] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-border/40">
                        <div className="relative">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ค้นหาหมวดหมู่..."
                                className="w-full h-10 bg-muted/30 rounded-lg pl-9 pr-4 text-xs font-bold outline-none focus:bg-muted/50"
                            />
                        </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto p-1 scrollbar-hide">
                        {filtered.length > 0 ? (
                            filtered.map((cat: string) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                        onChange(cat);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary/5 text-sm font-bold text-left transition-colors"
                                >
                                    {cat}
                                    {value === cat && <Check size={14} className="text-primary" />}
                                </button>
                            ))
                        ) : (
                            <div className="py-4 text-center text-[10px] font-bold text-muted-foreground uppercase">
                                ไม่พบข้อมูล
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            onAdd();
                            setIsOpen(false);
                        }}
                        className="w-full p-4 bg-primary/5 flex items-center justify-center gap-2 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/10 transition-all border-t border-primary/10"
                    >
                        <Plus size={14} strokeWidth={3} />
                        เพิ่มหมวดหมู่ใหม่
                    </button>
                </div>
            )}
        </div>
    );
}
