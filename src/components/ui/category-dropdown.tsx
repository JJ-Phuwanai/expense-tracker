"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CategoryDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategoryDropdown({ value, onChange }: CategoryDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  // ดึงข้อมูลจาก API แค่ที่เดียว
  React.useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const res = await fetch("/api/settings/categories");
        const data = await res.json();
        setCategories(data.categories ?? []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-muted/30 border-none h-12 rounded-xl px-4 text-sm font-normal hover:bg-muted/50"
        >
          {value ? value : "เลือกหมวดหมู่"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl shadow-xl border-border/50">
        <Command>
          <CommandInput placeholder="ค้นหาหมวดหมู่" className="h-12" />
          <CommandList>
            <CommandEmpty>ไม่พบหมวดหมู่</CommandEmpty>
            <CommandGroup>
              {categories.map((cat) => (
                <CommandItem
                  key={cat}
                  value={cat}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className="h-11 px-4"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === cat ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {cat}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
