"use client";

import { X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LimitModal({ isOpen, value, onChange, onSave, onClose }: any) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-8 animate-in fade-in duration-300">
      <div className="w-full max-w-[300px] bg-card rounded-[2.5rem] p-6 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-start mb-5">
          <div className="space-y-0.5">
            <h3 className="text-base font-black tracking-tight text-foreground">
              งบประมาณ
            </h3>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
              รายเดือน
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-muted/50 rounded-full active:scale-90 transition-all text-muted-foreground"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-black text-primary/40">
              ฿
            </span>
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="0.00"
              className="w-full h-16 rounded-2xl bg-muted/30 border-none pl-10 pr-5 text-2xl font-black text-foreground focus:bg-muted/50 transition-all outline-none text-right tabular-nums shadow-inner"
              autoFocus
            />
          </div>

          <Button
            onClick={onSave}
            className="w-full h-12 rounded-xl font-black text-sm bg-foreground text-background hover:bg-foreground/90 active:scale-[0.97] transition-all shadow-lg shadow-black/5"
          >
            <Check className="mr-2" size={16} strokeWidth={3} />
            บันทึกข้อมูล
          </Button>
        </div>
      </div>
    </div>
  );
}
