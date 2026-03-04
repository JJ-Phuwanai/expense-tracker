'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { BudgetHeader } from '@/components/budget-plan/budget-header';
import { BudgetGrid } from '@/components/budget-plan/budget-grid';
import { BudgetItemList } from '@/components/budget-plan/budget-item-list';
import { BudgetFormModal } from '@/components/budget-plan/budget-form-modal';
import { LimitModal } from '@/components/budget-plan/limit-modal';
import { DeleteConfirmModal } from '@/components/budget-plan/delete-confirm-modal';
import { useUser } from '@/context/user-context';

export default function BudgetPlanPage() {
    const { currentUserId, userName } = useUser();
    const [plans, setPlans] = useState<any[]>([]);
    const [dailyExpenses, setDailyExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<number | null>(null);
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
    const [limitData, setLimitData] = useState({ rowIndex: 0, amount: '' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [rowToDelete, setRowToDelete] = useState<number | null>(null);

    const currentMonthLabel = useMemo(() => format(new Date(), 'MMMM yyyy', { locale: th }), []);
    const currentMonthValue = useMemo(() => format(new Date(), 'MM/yyyy'), []);

    const [formData, setFormData] = useState({ section: '', item: '', amount: '', date: '' });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [resPlans, resExp] = await Promise.all([
                fetch(`/api/budget-plan?personId=${currentUserId}`, { cache: 'no-store' }),
                fetch(`/api/expenses?personId=${currentUserId}`, { cache: 'no-store' }),
            ]);
            const dataPlans = await resPlans.json();
            const dataExp = await resExp.json();
            setPlans(dataPlans.plans || []);
            setDailyExpenses(dataExp.expenses || []);
        } catch (err) {
            console.error('Load failed', err);
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const NetSpent = useMemo(() => {
        const myItems = dailyExpenses.filter((item) => String(item.owner) === String(userName));
        let income = 0;
        let expense = 0;

        myItems.forEach((item) => {
            const amt = Number(item.amount) || 0;
            if (item.type === 'รายรับ') income += amt;
            else expense += amt;
        });

        return income - expense;
    }, [dailyExpenses, currentUserId]);

    const actualFuelSpent = useMemo(() => {
        return dailyExpenses
            .filter((exp: any) => exp.owner === userName && exp.category === 'น้ำมันรถ')
            .reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);
    }, [dailyExpenses, userName]);

    const groupedPlans = useMemo(() => {
        const groups: any = {};
        const myPlans = plans.filter((p) => String(p.person_id) === String(currentUserId));

        myPlans.forEach((p) => {
            const sec = p.section || 'อื่นๆ';
            if (!groups[sec])
                groups[sec] = {
                    total: 0,
                    unpaidTotal: 0,
                    count: 0,
                    unpaidCount: 0,
                    items: [],
                };
            const amt = Number(p.amount);

            if (p.item === 'ค่าน้ำมันพาหนะ') {
                const remaining = Math.max(0, amt - actualFuelSpent);
                groups[sec].unpaidTotal += remaining;
                if (remaining > 0) groups[sec].unpaidCount += 1;
            } else if (p.note !== 'จ่ายแล้ว') {
                groups[sec].unpaidTotal += amt;
                groups[sec].unpaidCount += 1;
            }

            groups[sec].total += amt;
            groups[sec].count += 1;
            groups[sec].items.push(p);
        });
        return groups;
    }, [plans, currentUserId, actualFuelSpent]);

    const sortedSections = useMemo(() => {
        const entries = Object.entries(groupedPlans);
        const result = [...entries];
        const monthlyIdx = result.findIndex(([name]) => name === 'ค่าใช้จ่ายประจำเดือน');
        if (monthlyIdx !== -1) {
            const [item] = result.splice(monthlyIdx, 1);
            const salaryIdx = result.findIndex(([name]) => name === 'เงินเดือน');
            result.splice(salaryIdx + 1, 0, item);
        }
        return result;
    }, [groupedPlans]);

    const totalPlannedExpenses = useMemo(() => {
        const myPlans = plans.filter((p) => String(p.person_id) === String(currentUserId) && p.section !== 'เงินเดือน');

        return myPlans.reduce((sum, p) => {
            const amt = Number(p.amount);
            if (p.item === 'ค่าน้ำมันพาหนะ') {
                return sum + Math.max(0, amt - actualFuelSpent);
            }
            return p.note !== 'จ่ายแล้ว' ? sum + amt : sum;
        }, 0);
    }, [plans, currentUserId, actualFuelSpent]);

    const handleDeleteAction = async () => {
        const res = await fetch('/api/budget-plan', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rowIndex: rowToDelete }),
        });
        if (res.ok) {
            setIsDeleteModalOpen(false);
            await loadData();
        }
    };

    const handleUpdateLimit = async () => {
        const plan = plans.find((p) => p.rowIndex === limitData.rowIndex);
        const res = await fetch('/api/budget-plan', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...plan, amount: Number(limitData.amount) }),
        });
        if (res.ok) {
            setIsLimitModalOpen(false);
            await loadData();
        }
    };

    return (
        <main className="h-screen max-w-md mx-auto flex flex-col overflow-hidden bg-muted/40 font-sans relative">
            <BudgetHeader
                selectedSection={selectedSection}
                displayTitle={selectedSection ? `หมวดหมู่: ${selectedSection}` : `แผนงานเดือน ${currentMonthLabel}`}
                onBack={() => setSelectedSection(null)}
                totalAmount={selectedSection ? groupedPlans[selectedSection].unpaidTotal : totalPlannedExpenses}
                headerLabel={
                    selectedSection === 'เงินเดือน'
                        ? 'รายได้ทั้งหมด'
                        : selectedSection
                          ? 'ยอดคงเหลือที่ต้องจ่าย'
                          : 'ยอดรวมแผนงานทั้งหมด'
                }
            />

            <div className="flex-1 overflow-y-auto px-6 pb-32 scrollbar-hide">
                {loading ? (
                    <div className="py-20 text-center animate-pulse text-muted-foreground font-bold">กำลังโหลด...</div>
                ) : !selectedSection ? (
                    <BudgetGrid
                        sortedSections={sortedSections}
                        totalSpent={NetSpent}
                        onSelect={(name: string) => {
                            if (name === 'ค่าใช้จ่ายประจำเดือน') {
                                const plan = plans.find((p) => p.section === name);
                                if (plan) {
                                    setLimitData({ rowIndex: plan.rowIndex, amount: plan.amount.toString() });
                                    setIsLimitModalOpen(true);
                                }
                            } else setSelectedSection(name);
                        }}
                        onAdd={() => {
                            setEditingRow(null);
                            setIsModalOpen(true);
                        }}
                    />
                ) : (
                    <BudgetItemList
                        section={selectedSection}
                        items={groupedPlans[selectedSection].items}
                        dailyExpenses={dailyExpenses}
                        onEdit={(plan: any) => {
                            setEditingRow(plan.rowIndex);
                            setFormData({
                                section: plan.section,
                                item: plan.item,
                                amount: plan.amount.toString(),
                                date: plan.date,
                            });
                            setIsModalOpen(true);
                        }}
                        onDelete={(idx: number) => {
                            setRowToDelete(idx);
                            setIsDeleteModalOpen(true);
                        }}
                        onTogglePaid={async (plan: any) => {
                            const res = await fetch('/api/budget-plan', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ...plan, note: plan.note === 'จ่ายแล้ว' ? '' : 'จ่ายแล้ว' }),
                            });
                            if (res.ok) await loadData();
                        }}
                        onAdd={(sec: string) => {
                            setEditingRow(null);
                            setFormData({ ...formData, section: sec, date: currentMonthValue });
                            setIsModalOpen(true);
                        }}
                    />
                )}
            </div>

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAction}
            />

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
                    unpaidAmount={selectedSection ? groupedPlans[selectedSection].unpaidTotal : 0}
                    unpaidCount={selectedSection ? groupedPlans[selectedSection].unpaidCount : 0}
                />
            )}
        </main>
    );
}
