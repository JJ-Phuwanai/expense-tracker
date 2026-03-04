import { ChevronLeft, ChevronDown } from 'lucide-react';
import { useUser } from '@/context/user-context';
import { useState } from 'react';

export function BudgetHeader({ selectedSection, displayTitle, onBack, totalAmount, headerLabel }: any) {
    const { userName, users, switchUser } = useUser();
    const [showPicker, setShowPicker] = useState(false);

    return (
        <div className="flex-none p-6 pb-6 pt-8 bg-muted/40 backdrop-blur-md z-20">
            <div className="flex justify-between items-start px-1">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2 relative">
                        {' '}
                        {selectedSection && (
                            <button onClick={onBack} className="mr-1">
                                <ChevronLeft size={22} className="text-primary" strokeWidth={3} />
                            </button>
                        )}
                        <button
                            onClick={() => setShowPicker(!showPicker)}
                            className="flex items-center gap-1 group active:scale-95 transition-all"
                        >
                            <h2 className="text-2xl font-black tracking-tight text-foreground">สวัสดี {userName}</h2>
                            <ChevronDown
                                size={18}
                                className={`text-muted-foreground transition-transform ${showPicker ? 'rotate-180' : ''}`}
                            />
                        </button>
                        {showPicker && (
                            <div className="absolute top-full left-0 mt-2 w-40 bg-card border border-border/40 rounded-2xl shadow-xl p-2 z-[100] animate-in zoom-in-95 duration-200">
                                {users.map((u) => (
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
                    </div>
                    <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider ml-1">
                        {displayTitle}
                    </p>
                </div>

                <div className="text-right">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase block leading-none mb-1">
                        {headerLabel || 'ยอดบริหารจัดการรวม'}
                    </span>
                    <span
                        className={`text-lg font-black tabular-nums leading-none ${
                            selectedSection === 'เงินเดือน' ? 'text-emerald-600' : 'text-destructive'
                        }`}
                    >
                        ฿{totalAmount.toLocaleString()}
                        <span className="text-[10px] ml-1 font-bold text-muted-foreground uppercase">บาท</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
