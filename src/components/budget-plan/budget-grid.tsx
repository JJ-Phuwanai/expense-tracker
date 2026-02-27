import { PlusCircle, ChevronRight, PiggyBank, Landmark, ReceiptText, BanknoteArrowUp } from 'lucide-react';

export function BudgetGrid({ groupedPlans, onSelect, onAdd }: any) {
    const getIcon = (name: string) => {
        if (name.includes('เงินเก็บ')) return <PiggyBank size={28} />;
        if (name.includes('เงินเดือน')) return <Landmark size={28} />;
        if (name.includes('ค่าใช้จ่ายคงที่')) return <BanknoteArrowUp size={28} />;
        return <ReceiptText size={28} />;
    };

    const getColorClass = (name: string) => {
        if (name.includes('เงินเก็บ')) return 'bg-blue-500/10 text-blue-600';
        if (name.includes('เงินเดือน')) return 'bg-emerald-500/10 text-emerald-600';
        if (name.includes('ค่าใช้จ่ายคงที่')) return 'bg-yellow-500/10 text-yellow-600';
        return 'bg-rose-500/10 text-rose-600';
    };

    return (
        <div className="grid grid-cols-2 gap-4 pt-2">
            {Object.entries(groupedPlans).map(([name, data]: any) => (
                <button
                    key={name}
                    onClick={() => onSelect(name)}
                    className="group bg-card p-6 rounded-[2.5rem] border border-border/20 shadow-sm flex flex-col items-center text-center relative active:scale-95 transition-all duration-300"
                >
                    <div className={`p-4 rounded-[1.5rem] mb-4 ${getColorClass(name)}`}>{getIcon(name)}</div>
                    <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1 truncate w-full">
                        {name}
                    </p>
                    <p className="text-lg font-black font-sans leading-none mb-3 text-foreground">
                        ฿{data.total.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 bg-muted/50 px-3 py-1 rounded-full">
                        <span className="text-[10px] font-bold text-muted-foreground">{data.count} รายการ</span>
                        <ChevronRight size={10} className="text-muted-foreground" />
                    </div>
                </button>
            ))}
            <button
                onClick={() => onAdd()}
                className="bg-primary/5 p-6 rounded-[2.5rem] border-2 border-dashed border-primary/20 flex flex-col items-center justify-center text-primary active:scale-95 transition-all min-h-[160px]"
            >
                <PlusCircle size={32} strokeWidth={1.5} />
                <span className="text-xs font-black mt-2">เพิ่มแผนงาน</span>
            </button>
        </div>
    );
}
