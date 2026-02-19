"use client";

import React from "react";

interface Props {
  onSelect: (mode: "INDEX" | "CHAT_EXISTING" | "QUICK_CHAT") => void;
}

export function LandingMenu({ onSelect }: Props) {
  const Tile = ({
    label,
    mode,
    icon,
  }: {
    label: string;
    mode: Props["onSelect"] extends (m: infer U) => void ? U : never;
    icon: React.ReactNode;
  }) => (
    <button
      onClick={() => onSelect(mode)}
      className="w-56 h-44 rounded-xl bg-emerald-900/55 backdrop-blur border border-emerald-200/35 hover:border-emerald-100/70 text-emerald-50 flex flex-col items-center justify-center gap-2 transition"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  const ChatIcon = (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );

  return (
    <div className="flex gap-8">
      <Tile label="ابدأ المحادثة" mode={"QUICK_CHAT"} icon={ChatIcon} />
    </div>
  );
}
