"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Fingerprint, Sparkles, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DnaQuiz } from "@/features/travel-dna/components/dna-quiz";
import { DnaResult } from "@/features/travel-dna/components/dna-result";
import { DNA_QUESTIONS } from "@/features/travel-dna/questions";
import type { Dna } from "@/types";

type Phase = "intro" | "quiz" | "result";

export function TravelDnaClient({ initialDna }: { initialDna: Dna | null }) {
  const [phase, setPhase] = useState<Phase>(initialDna ? "result" : "intro");
  const [dna, setDna] = useState<Dna | null>(initialDna);

  if (phase === "quiz") {
    return (
      <DnaQuiz
        onComplete={(d) => {
          setDna(d);
          setPhase("result");
        }}
      />
    );
  }

  if (phase === "result" && dna) {
    return (
      <DnaResult
        dna={dna}
        savedInitially={!!initialDna && dna === initialDna}
        onRetake={() => {
          setDna(null);
          setPhase("quiz");
        }}
      />
    );
  }

  // Intro
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center shadow-xl shadow-black/5 sm:p-12"
    >
      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-surface-1 shadow-inner">
        <Fingerprint className="size-7 text-accent-goldText" />
      </div>
      <h2 className="font-display text-3xl">Discover your Travel DNA</h2>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        Answer {DNA_QUESTIONS.length} quick questions to reveal your traveler profile,
        match it against every destination, and power smarter, AI-assisted itineraries.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="size-4 text-accent-goldText" />
          Personalized radar
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Map className="size-4 text-accent-goldText" />
          Destination match scores
        </span>
      </div>
      <Button size="lg" className="mt-8 gap-2" onClick={() => setPhase("quiz")}>
        <Fingerprint className="size-4" />
        Start the assessment
      </Button>
    </motion.div>
  );
}
