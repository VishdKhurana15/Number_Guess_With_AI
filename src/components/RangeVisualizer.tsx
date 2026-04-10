import React from 'react';
import { motion } from 'motion/react';

interface RangeVisualizerProps {
  min: number;
  max: number;
  currentMin: number;
  currentMax: number;
  label: string;
  color: string;
}

export const RangeVisualizer: React.FC<RangeVisualizerProps> = ({
  min,
  max,
  currentMin,
  currentMax,
  label,
  color,
}) => {
  const totalRange = max - min;
  const startPercent = ((currentMin - min) / totalRange) * 100;
  const widthPercent = ((currentMax - currentMin) / totalRange) * 100;

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black italic">
        <span>{label}</span>
        <span className="text-purple-400">{currentMin} — {currentMax}</span>
      </div>
      <div className="h-4 bg-white/5 rounded-full overflow-hidden relative border border-white/5 shadow-inner">
        <motion.div
          initial={false}
          animate={{
            left: `${startPercent}%`,
            width: `${widthPercent}%`,
          }}
          className={`absolute h-full ${color} opacity-40 shadow-[0_0_20px_rgba(168,85,247,0.3)]`}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        />
        {/* Animated bubbles inside the range */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, 100, 0],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              className="absolute w-2 h-2 bg-white rounded-full blur-[1px]"
              style={{ top: `${i * 20}%`, left: `${i * 10}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
