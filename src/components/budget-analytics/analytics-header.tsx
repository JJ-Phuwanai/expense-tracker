'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function AnalyticsHeader({ userName, users, switchUser, onBack, selectedMonth, netBalance }: any) {
    const [showPicker, setShowPicker] = useState(false);

    return (
        <div className="flex-none p-6 pb-6 pt-8 bg-muted/40 backdrop-blur-md z-20">
            <div className="flex justify-between items-start px-1">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2 relative">
                        <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-1">
                            <h2 className="text-2xl font-black tracking-tight text-foreground">สวัสดี {userName}</h2>
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
                                        className="w-full text-left px-4 py-2.5 text-sm font-bold rounded-xl hover:bg-muted"
                                    >
                                        {u.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider ml-1">
                        สถิติ ({selectedMonth})
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase block mb-1">
                        ยอดคงเหลือสุทธิ
                    </span>
                    <span
                        className={`text-xl font-black tabular-nums ${netBalance >= 0 ? 'text-emerald-600' : 'text-destructive'}`}
                    >
                        ฿{netBalance.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
