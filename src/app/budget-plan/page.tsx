"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { BudgetHeader } from "@/components/budget-plan/budget-header";
import { BudgetGrid } from "@/components/budget-plan/budget-grid";
import { BudgetItemList } from "@/components/budget-plan/budget-item-list";
import { BudgetFormModal } from "@/components/budget-plan/budget-form-modal";
import { LimitModal } from "@/components/budget-plan/limit-modal";

export default function BudgetPlanPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [dailyExpenses, setDailyExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [limitData, setLimitData] = useState({ rowIndex: 0, amount: "" });

  const currentMonthLabel = format(new Date(), "MMMM yyyy", { locale: th });
  const currentMonthValue = format(new Date(), "MM/yyyy");

  const [formData, setFormData] = useState({
    section: "",
    item: "",
    amount: "",
    date: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resPlans, resExp] = await Promise.all([
        fetch("/api/budget-plan", { cache: "no-store" }),
        fetch("/api/expenses", { cache: "no-store" }),
      ]);

      const dataPlans = await resPlans.json();
      const dataExp = await resExp.json();

      setPlans(dataPlans.plans || []);
      setDailyExpenses(dataExp.expenses || []);
    } catch (err) {
      console.error("Load failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const jjNetSpent = useMemo(() => {
    const jjItems = dailyExpenses.filter((item) => item.owner === "JJ");
    let income = 0;
    let expense = 0;

    jjItems.forEach((item) => {
      const amt = Number(item.amount) || 0;
      if (item.type === "รายรับ") income += amt;
      else expense += amt;
    });

    return income - expense;
  }, [dailyExpenses]);

  const groupedPlans = useMemo(() => {
    const groups: any = {};
    plans.forEach((p) => {
      const sec = p.section || "อื่นๆ";
      if (!groups[sec])
        groups[sec] = {
          total: 0,
          unpaidTotal: 0,
          count: 0,
          unpaidCount: 0,
          items: [],
        };
      const amt = Number(p.amount);
      if (p.note !== "จ่ายแล้ว") {
        groups[sec].unpaidTotal += amt;
        groups[sec].unpaidCount += 1;
      }
      groups[sec].total += amt;
      groups[sec].count += 1;
      groups[sec].items.push(p);
    });
    return groups;
  }, [plans]);

  const sortedSections = useMemo(() => {
    const entries = Object.entries(groupedPlans);
    const salaryIdx = entries.findIndex(([name]) => name === "เงินเดือน");
    const monthlyIdx = entries.findIndex(
      ([name]) => name === "ค่าใช้จ่ายประจำเดือน",
    );

    let result = [...entries];
    if (monthlyIdx !== -1) {
      const [item] = result.splice(monthlyIdx, 1);
      result.splice(salaryIdx + 1, 0, item);
    }
    return result;
  }, [groupedPlans]);

  const handleTogglePaid = async (plan: any) => {
    const newNote = plan.note === "จ่ายแล้ว" ? "" : "จ่ายแล้ว";
    const res = await fetch("/api/budget-plan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...plan, note: newNote }),
    });
    if (res.ok) await loadData();
  };

  const startEdit = (plan: any) => {
    setEditingRow(plan.rowIndex);
    setFormData({
      section: plan.section,
      item: plan.item,
      amount: plan.amount.toString(),
      date: plan.date,
    });
    setIsModalOpen(true);
  };

  const handleGridSelect = (name: string) => {
    if (name === "ค่าใช้จ่ายประจำเดือน") {
      const plan = plans.find((p) => p.section === name);
      if (plan) {
        setLimitData({
          rowIndex: plan.rowIndex,
          amount: plan.amount.toString(),
        });
        setIsLimitModalOpen(true);
      }
    } else {
      setSelectedSection(name);
    }
  };

  const handleUpdateLimit = async () => {
    const plan = plans.find((p) => p.rowIndex === limitData.rowIndex);
    const res = await fetch("/api/budget-plan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...plan,
        amount: Number(limitData.amount),
      }),
    });
    if (res.ok) {
      setIsLimitModalOpen(false);
      await loadData();
    }
  };

  const totalPlannedExpenses = useMemo(
    () =>
      plans
        .filter((p) => p.section !== "เงินเดือน")
        .reduce((sum, p) => sum + Number(p.amount), 0),
    [plans],
  );

  return (
    <main className="h-screen max-w-md mx-auto flex flex-col overflow-hidden bg-muted/40 font-sans relative">
      <BudgetHeader
        selectedSection={selectedSection}
        displayTitle={
          selectedSection
            ? `หมวดหมู่: ${selectedSection}`
            : `แผนงานเดือน ${currentMonthLabel}`
        }
        onBack={() => setSelectedSection(null)}
        totalAmount={
          selectedSection
            ? groupedPlans[selectedSection].unpaidTotal
            : totalPlannedExpenses
        }
        headerLabel={
          selectedSection ? "ยอดคงเหลือที่ต้องจ่าย" : "ยอดรวมแผนงานทั้งหมด"
        }
      />

      <div className="flex-1 overflow-y-auto px-6 pb-32 scrollbar-hide">
        {loading ? (
          <div className="py-20 text-center animate-pulse text-muted-foreground font-bold">
            กำลังโหลด...
          </div>
        ) : !selectedSection ? (
          <BudgetGrid
            sortedSections={sortedSections}
            totalSpent={jjNetSpent}
            onSelect={handleGridSelect}
            onAdd={() => {
              setEditingRow(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <BudgetItemList
            section={selectedSection}
            items={groupedPlans[selectedSection].items}
            onEdit={startEdit}
            onAdd={(sec: string) => {
              setEditingRow(null);
              setFormData({
                ...formData,
                section: sec,
                date: currentMonthValue,
              });
              setIsModalOpen(true);
            }}
            onTogglePaid={handleTogglePaid}
          />
        )}
      </div>

      <LimitModal
        isOpen={isLimitModalOpen}
        value={limitData.amount}
        onChange={(val: string) => setLimitData({ ...limitData, amount: val })}
        onSave={handleUpdateLimit}
        onClose={() => setIsLimitModalOpen(false)}
      />

      {isModalOpen && (
        <BudgetFormModal
          isOpen={isModalOpen}
          editingRow={editingRow}
          formData={formData}
          setFormData={setFormData}
          selectedSection={selectedSection}
          onClose={() => setIsModalOpen(false)}
          onRefresh={loadData}
          unpaidAmount={
            selectedSection ? groupedPlans[selectedSection].unpaidTotal : 0
          }
          unpaidCount={
            selectedSection ? groupedPlans[selectedSection].unpaidCount : 0
          }
        />
      )}
    </main>
  );
}
