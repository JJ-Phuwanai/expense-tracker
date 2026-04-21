// 📁 app/loading.tsx
'use client';

import { motion } from 'framer-motion';

export default function LoadingScreen() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-white z-[9999]"
        >
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="flex flex-col items-center gap-5"
            >
                <div className="w-24 h-24 bg-emerald-100/50 rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-emerald-500/5">
                    <span className="text-5xl font-black text-emerald-500">B</span>
                </div>
                <div className="space-y-1 text-center">
                    <h2 className="text-xl font-black tracking-tighter text-slate-800">Budget Craft</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Crafting Your Future
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
