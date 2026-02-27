import { ChevronLeft } from 'lucide-react';

interface BudgetHeaderProps {
    selectedSection: string | null;
    displayTitle: string;
    onBack: () => void;
    totalAmount: number;
}

export function BudgetHeader({ selectedSection, displayTitle, onBack, totalAmount }: BudgetHeaderProps) {
    return (
        <div className="flex-none p-6 pb-6 pt-8 bg-muted/40 backdrop-blur-md z-20">
            <div className="flex justify-between items-start px-1">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        {selectedSection && (
                            <button onClick={onBack} className="mr-1 active:scale-90 transition-all">
                                <ChevronLeft size={22} className="text-primary" strokeWidth={3} />
                            </button>
                        )}
                        <h2 className="text-2xl font-black tracking-tight text-foreground">สวัสดี JJ</h2>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider ml-1">
                        {displayTitle}
                    </p>
                </div>

                <div className="text-right">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase block leading-none mb-1">
                        {selectedSection ? 'ยอดรวมหมวดหมู่' : 'ยอดบริหารจัดการรวม'}
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
