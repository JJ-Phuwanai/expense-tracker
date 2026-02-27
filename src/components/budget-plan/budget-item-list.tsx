import { Pencil, PlusCircle } from 'lucide-react';

export function BudgetItemList({ section, items, total, onEdit, onAdd }: any) {
    return (
        <div className="space-y-4 pt-2 animate-in slide-in-from-right duration-500">
            <div className="space-y-3">
                {items.map((plan: any) => (
                    <div
                        key={plan.rowIndex}
                        className="flex items-center justify-between p-5 bg-card border border-border/30 rounded-[2rem] shadow-sm"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-foreground truncate">{plan.item}</p>
                            <p className="text-[10px] text-muted-foreground font-bold tracking-tighter uppercase">
                                {plan.date}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="font-sans text-base font-black text-foreground">
                                ฿{plan.amount.toLocaleString()}
                            </p>
                            <button
                                onClick={() => onEdit(plan)}
                                className="p-2.5 bg-muted/50 hover:bg-muted rounded-xl text-muted-foreground transition-colors"
                            >
                                <Pencil size={14} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => onAdd(section)}
                className="w-full py-4 border-2 border-dashed border-border/60 rounded-[2rem] flex flex-col items-center justify-center bg-muted/20 text-muted-foreground active:scale-95 transition-all mt-2"
            >
                <PlusCircle size={24} className="text-foreground mb-1" />
                <span className="text-xs font-black text-foreground">เพิ่มรายการใน {section}</span>
            </button>
        </div>
    );
}
