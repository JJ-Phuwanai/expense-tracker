'use client';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm }: DeleteConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-8 animate-in fade-in duration-200">
            <div className="w-full max-w-[280px] bg-card rounded-[2.5rem] p-6 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-300">
                <h3 className="text-lg font-black text-center mb-2">ยืนยันการลบ?</h3>
                <p className="text-[10px] text-muted-foreground text-center mb-6 font-bold uppercase tracking-widest">
                    รายการนี้จะหายไปจากแผนงาน
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl font-bold text-sm bg-muted text-muted-foreground"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 h-12 rounded-xl font-black text-sm bg-destructive text-white shadow-lg shadow-destructive/20 active:scale-95 transition-all"
                    >
                        ลบรายการ
                    </button>
                </div>
            </div>
        </div>
    );
}
