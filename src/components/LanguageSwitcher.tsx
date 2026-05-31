import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Lang = "en" | "ru";
const STORAGE_KEY = "nimus.lang";

function readLang(): Lang {
  if (typeof window === "undefined") return "en";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "ru" ? "ru" : "en";
}

export function LanguageSwitcher() {
  const [lang, setLang] = useState<Lang>("en");

  // Hydrate from localStorage on client only (avoid SSR mismatch)
  useEffect(() => {
    setLang(readLang());
  }, []);

  const change = (next: Lang) => {
    setLang(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      window.dispatchEvent(new CustomEvent("nimus:lang-change", { detail: next }));
    } catch {}
  };

  const options: { code: Lang; flag: string; label: string }[] = [
    { code: "en", flag: "🇬🇧", label: "English" },
    { code: "ru", flag: "🇷🇺", label: "Русский" },
  ];

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-background/60 p-0.5">
      {options.map((o) => (
        <button
          key={o.code}
          type="button"
          onClick={() => change(o.code)}
          aria-label={o.label}
          aria-pressed={lang === o.code}
          className={cn(
            "grid place-items-center size-7 rounded-full text-base leading-none transition-all",
            lang === o.code
              ? "bg-primary/10 ring-1 ring-primary/30 scale-105"
              : "opacity-50 hover:opacity-100"
          )}
        >
          <span aria-hidden>{o.flag}</span>
        </button>
      ))}
    </div>
  );
}
