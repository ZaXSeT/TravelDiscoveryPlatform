"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { DNA_QUESTIONS } from "@/features/travel-dna/questions";
import { computeUserDna } from "@/features/travel-dna/scoring";
import type { Dna } from "@/types";

export function DnaQuiz({ onComplete }: { onComplete: (dna: Dna) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const q = DNA_QUESTIONS[step];
  const total = DNA_QUESTIONS.length;
  if (!q) return null;

  const choose = (optIdx: number) => {
    const next = { ...answers, [q.id]: optIdx };
    setAnswers(next);
    if (step + 1 < total) setStep(step + 1);
    else onComplete(computeUserDna(next));
  };

  const progress = Math.round((step / total) * 100);

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-xl shadow-black/5 sm:p-10">
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1 disabled:opacity-0"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </button>
          <span>
            Question {step + 1} of {total}
          </span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="h-full rounded-full bg-accent-gold"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="font-display text-2xl sm:text-3xl">{q.prompt}</h2>
          <div className="mt-6 grid gap-3">
            {q.options.map((opt, i) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => choose(i)}
                className="group flex items-center justify-between rounded-2xl border border-border bg-surface-1 p-4 text-left transition-colors hover:border-accent-gold hover:bg-accent-gold/5"
              >
                <span className="font-medium text-foreground">{opt.label}</span>
                <span className="ml-4 flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-xs text-muted-foreground transition-colors group-hover:border-accent-gold group-hover:text-accent-goldText">
                  {String.fromCharCode(65 + i)}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
