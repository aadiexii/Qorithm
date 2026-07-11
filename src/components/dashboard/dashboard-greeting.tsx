"use client";

import { useEffect, useState } from "react";

interface DashboardGreetingProps {
  firstName: string | null;
}

export function DashboardGreeting({ firstName }: DashboardGreetingProps) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const resolvedName = firstName || "there";
    const hour = parseInt(
      new Date().toLocaleString("en-IN", {
        hour: "numeric",
        hour12: false,
        timeZone: "Asia/Kolkata",
      }),
      10
    );

    let timePhrase = "Evening";
    if (hour >= 4 && hour < 12) {
      timePhrase = "Morning";
    } else if (hour >= 12 && hour < 17) {
      timePhrase = "Afternoon";
    } else if (hour >= 17 && hour < 22) {
      timePhrase = "Evening";
    } else {
      timePhrase = "Night";
    }

    setGreeting(`Good ${timePhrase} :) ${resolvedName}`);
  }, [firstName]);

  // Fallback during server rendering to avoid layout shift (renders invisible space of similar size)
  if (!greeting) {
    return <h1 className="text-2xl font-extrabold tracking-tight text-transparent">Good Evening</h1>;
  }

  return (
    <h1 className="text-2xl font-extrabold tracking-tight text-white">
      {greeting}
    </h1>
  );
}
