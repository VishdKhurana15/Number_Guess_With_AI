import React from 'react';
import { GuessRecord } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, ArrowDown, Check, Ghost } from 'lucide-react';

interface GuessHistoryProps {
  guesses: GuessRecord[];
  title: string;
}

export const GuessHistory: React.FC<GuessHistoryProps> = ({ guesses, title }) => {
  return (
    <div className="flex flex-col h-full bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-xl">
      <div className="p-4 border-b border-white/5 bg-white/5">
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-purple-400 font-black italic">{title}</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-none">
        <AnimatePresence initial={false}>
          {[...guesses].reverse().map((record, index) => (
            <motion.div
              key={`${title}-${record.turn}`}
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 text-sm font-mono group hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-zinc-600 text-[10px] font-black">#{record.turn}</span>
                <span className="text-white font-black text-lg">{record.guess}</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={record.feedback === 'Correct' ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  {record.feedback === 'Higher' && <ArrowUp className="w-4 h-4 text-blue-400" />}
                  {record.feedback === 'Lower' && <ArrowDown className="w-4 h-4 text-orange-400" />}
                  {record.feedback === 'Correct' && <Check className="w-4 h-4 text-green-400" />}
                </motion.div>
                <span className={`text-[10px] uppercase font-black tracking-widest ${
                  record.feedback === 'Higher' ? 'text-blue-400' :
                  record.feedback === 'Lower' ? 'text-orange-400' : 'text-green-400'
                }`}>
                  {record.feedback}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {guesses.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-20 py-12">
            <Ghost className="w-12 h-12 mb-2" />
            <p className="text-[10px] uppercase font-black tracking-widest">Ghost Town</p>
          </div>
        )}
      </div>
    </div>
  );
};
