"use client";

import { motion } from "framer-motion";
import { Trash2, Pencil, PlusCircle, CheckCircle2, Circle } from "lucide-react";

export function BudgetItemList({
  section,
  items,
  onDelete,
  onEdit,
  onAdd,
  onTogglePaid,
}: any) {
  return (
    <div className="space-y-4 pt-2 px-4 animate-in slide-in-from-right duration-500 overflow-hidden">
      <div className="space-y-3">
        {items.map((plan: any) => {
          const isPaid =
            section !== "เงินเดือน" && plan.note?.includes("จ่ายแล้ว");

          return (
            <div key={plan.rowIndex} className="relative group">
              {!isPaid && (
                <div className="absolute inset-0 flex items-center justify-end pr-3">
                  <button
                    onClick={() => onDelete(plan.rowIndex)}
                    className="p-6.5 bg-destructive rounded-r-[2rem] rounded-l-none py-6 pl-50 pr-4 text-white border border-border/30 shadow-sm active:scale-90 transition-all flex items-center justify-center"
                  >
                    <Trash2 size={22} strokeWidth={2.5} />
                  </button>
                </div>
              )}

              <motion.div
                drag={isPaid ? false : "x"}
                dragConstraints={{ left: -60, right: 0 }}
                dragElastic={0.1}
                className={`relative z-10 flex items-center justify-between p-5 bg-card border border-border/30 rounded-[2rem] shadow-sm transition-opacity active:scale-[0.98] ${
                  isPaid
                    ? "opacity-60 cursor-default"
                    : "opacity-100 cursor-grab active:cursor-grabbing"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  {section !== "เงินเดือน" && (
                    <button
                      onClick={() => onTogglePaid(plan)}
                      className={`shrink-0 transition-colors ${
                        isPaid ? "text-emerald-500" : "text-muted-foreground/30"
                      }`}
                    >
                      {isPaid ? (
                        <CheckCircle2 size={24} strokeWidth={2.5} />
                      ) : (
                        <Circle size={24} strokeWidth={2} />
                      )}
                    </button>
                  )}

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-black text-foreground truncate ${isPaid ? "line-through decoration-emerald-500/50" : ""}`}
                    >
                      {plan.item}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-bold tracking-tighter uppercase">
                      {plan.date} {isPaid && "• จ่ายแล้ว"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <p
                    className={`font-sans text-base font-black ${isPaid ? "text-emerald-600" : "text-foreground"}`}
                  >
                    ฿{plan.amount.toLocaleString()}
                  </p>
                  <button
                    onClick={() => onEdit(plan)}
                    className="p-2.5 bg-muted/50 hover:bg-muted rounded-xl text-muted-foreground transition-colors"
                  >
                    <Pencil size={14} strokeWidth={3} />
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onAdd(section)}
        className="w-full py-4 border-2 border-dashed border-border/60 rounded-[2.5rem] flex flex-col items-center justify-center bg-muted/20 text-muted-foreground active:scale-95 transition-all mt-2"
      >
        <PlusCircle size={24} className="text-foreground mb-1" />
        <span className="text-xs font-black text-foreground">
          เพิ่มรายการใน {section}
        </span>
      </button>
    </div>
  );
}
