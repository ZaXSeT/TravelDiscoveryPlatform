"use client";

import { useEffect, useState } from "react";

export function LocalTime() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return (
      <div className="flex flex-col gap-1">
        <div className="h-5 w-32 bg-white/10 animate-pulse rounded" />
        <div className="h-5 w-24 bg-white/10 animate-pulse rounded mt-1" />
      </div>
    );
  }

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <div className="flex flex-col gap-1 text-white/80">
      <span>{dateFormatter.format(time)}</span>
      <span>{timeFormatter.format(time)}</span>
    </div>
  );
}
