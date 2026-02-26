"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface HistoryFiltersProps {
  q: string;
  setQ: (val: string) => void;
  filterType: string;
  setFilterType: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  fromISO: string;
  setFromISO: (val: string) => void;
  toISO: string;
  setToISO: (val: string) => void;
  onReset: () => void;
  optionSets: { types: string[]; categories: string[] };
}

export function HistoryFilters(props: HistoryFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <input
            value={props.q}
            onChange={(e) => props.setQ(e.target.value)}
            placeholder="ค้นหารายการ..."
            className="w-full bg-card h-12 pl-10 pr-4 rounded-2xl text-sm border-none shadow-sm outline-none transition-all"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "secondary"}
          onClick={() => setShowFilters(!showFilters)}
          className="h-12 w-12 rounded-2xl p-0 shadow-sm"
        >
          <SlidersHorizontal size={20} />
        </Button>
      </div>

      {showFilters && (
        <Card className="rounded-[2rem] border-none shadow-lg animate-in fade-in zoom-in duration-200">
          <CardContent className="p-5 grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <select
                className="h-10 rounded-xl bg-muted/50 border-none text-xs px-3"
                value={props.filterType}
                onChange={(e) => props.setFilterType(e.target.value)}
              >
                <option value="all">ทุกประเภท</option>
                {props.optionSets.types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                className="h-10 rounded-xl bg-muted/50 border-none text-xs px-3"
                value={props.filterCategory}
                onChange={(e) => props.setFilterCategory(e.target.value)}
              >
                <option value="all">ทุกหมวดหมู่</option>
                {props.optionSets.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <Calendar size={14} className="text-muted-foreground shrink-0" />
              <input
                type="date"
                value={props.fromISO}
                onChange={(e) => props.setFromISO(e.target.value)}
                className="flex-1 h-10 rounded-xl bg-muted/50 border-none text-[10px] px-2"
              />
              <span className="text-muted-foreground">-</span>
              <input
                type="date"
                value={props.toISO}
                onChange={(e) => props.setToISO(e.target.value)}
                className="flex-1 h-10 rounded-xl bg-muted/50 border-none text-[10px] px-2"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={props.onReset}
              className="h-8 text-[10px] text-muted-foreground uppercase font-bold"
            >
              ล้างตัวกรองทั้งหมด
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
