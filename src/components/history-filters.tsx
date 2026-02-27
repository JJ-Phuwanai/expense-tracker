'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface HistoryFiltersProps {
    q: string;
    setQ: (val: string) => void;
    filterCategory: string;
    setFilterCategory: (val: string) => void;
    fromISO: string;
    setFromISO: (val: string) => void;
    toISO: string;
    setToISO: (val: string) => void;
    onReset: () => void;
    categories: string[];
}

export function HistoryFilters(props: HistoryFiltersProps) {
    const [showFilters, setShowFilters] = useState(false);

    // เช็คว่ามีการใช้ตัวกรองอยู่หรือไม่เพื่อแสดงจุดแจ้งเตือน
    const hasActiveFilters = props.filterCategory !== 'all' || props.fromISO || props.toISO;

    return (
        <div className="space-y-4">
            {/* Search Bar & Filter Toggle Button */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
                    <input
                        value={props.q}
                        onChange={(e) => props.setQ(e.target.value)}
                        placeholder="ค้นหารายการ"
                        className="w-full bg-card h-12 pl-11 pr-4 rounded-2xl text-sm border-none shadow-sm outline-none transition-all font-sans focus:ring-2 ring-primary/10"
                    />
                </div>
                <Button
                    variant={showFilters ? 'default' : 'secondary'}
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-12 w-12 rounded-2xl p-0 shadow-sm relative shrink-0"
                >
                    <SlidersHorizontal size={20} />
                    {hasActiveFilters && !showFilters && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                    )}
                </Button>
            </div>

            {/* Collapsible Filter Panel */}
            {showFilters && (
                <Card className="rounded-[2.5rem] border-none shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
                    <CardContent className="pl-6 pr-6 space-y-5">
                        {/* หมวดหมู่ */}
                        <div className="space-y-1 mb-0">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                หมวดหมู่
                            </label>
                            <select
                                className="w-full h-12 rounded-2xl bg-muted/50 border-none text-sm px-4 outline-none appearance-none font-sans opacity-50"
                                value={props.filterCategory}
                                onChange={(e) => props.setFilterCategory(e.target.value)}
                            >
                                <option value="all">ทุกหมวดหมู่</option>
                                {props.categories.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* ช่วงวันที่ */}
                        <div className="space-y-1 mb-0">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                ช่วงวันที่
                            </label>
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-muted/50 rounded-2xl px-4 h-12">
                                <input
                                    type="date"
                                    value={props.fromISO}
                                    onChange={(e) => props.setFromISO(e.target.value)}
                                    className="bg-transparent border-none text-xs focus:ring-0 outline-none w-full font-sans opacity-50"
                                />
                                <span className="text-muted-foreground/30 text-xs">—</span>
                                <input
                                    type="date"
                                    value={props.toISO}
                                    onChange={(e) => props.setToISO(e.target.value)}
                                    className="bg-transparent border-none text-xs focus:ring-0 outline-none w-full font-sans opacity-50"
                                />
                            </div>
                        </div>

                        {/* ปุ่มล้างตัวกรอง */}
                        <button
                            onClick={props.onReset}
                            className="w-full py-2 text-[11px] text-muted-foreground hover:text-primary font-bold uppercase tracking-tighter transition-colors"
                        >
                            ล้างตัวกรองทั้งหมด
                        </button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
