'use client';

import { ArrowRightLeft } from 'lucide-react';

export function MonthSelector({ options, selected, onSelect, isComparing, onToggleCompare, compareMonth }: any) {
    return (
        <div className="flex items-center justify-between gap-2">
            <div className="flex bg-card p-1 rounded-2xl border border-border/40 shadow-sm flex-1 overflow-x-auto no-scrollbar">
                {options.map((m: any) => (
                    <button
                        key={m.value}
                        onClick={() => onSelect(m.value)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                            (isComparing ? compareMonth === m.value : selected === m.value)
                                ? 'bg-primary text-primary-foreground shadow-lg'
                                : 'text-muted-foreground hover:bg-muted'
                        }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>
            <button
                onClick={onToggleCompare}
                className={`p-3 rounded-2xl border transition-all ${isComparing ? 'bg-orange-500 text-white border-orange-600 shadow-orange-200 shadow-lg' : 'bg-card text-muted-foreground border-border/40'}`}
            >
                <ArrowRightLeft size={20} />
            </button>
        </div>
    );
}
