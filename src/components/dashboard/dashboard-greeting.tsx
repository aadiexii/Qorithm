"use client";

import { useEffect, useState } from "react";

interface DashboardGreetingProps {
  name: string;
}

export function DashboardGreeting({ name }: DashboardGreetingProps) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const firstName = name.split(" ")[0] || "You";
    const hour = new Date().getHours();

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

    setGreeting(`Good ${timePhrase} :) ${firstName}`);
  }, [name]);

  // Fallback during server rendering to avoid layout shift (renders invisible space of similar size)
  if (!greeting) {
    return <h1 className="text-2xl font-extrabold tracking-tight text-transparent">Good Evening :) User</h1>;
  }

  return (
    <h1 className="text-2xl font-extrabold tracking-tight text-white">
      {greeting}
    </h1>
  );
}
