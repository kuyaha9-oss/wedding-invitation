import {
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Heart,
  MapPin,
  Sparkles,
} from "lucide-react";
import React, { useState } from "react";
import type { AppConfig } from "../types";

const EventDetails: React.FC<{ config: AppConfig }> = ({ config }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(config.venue.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="event"
      className="bg-secondary/30 dark:bg-darkBg px-4 py-20 transition-colors duration-1000 md:px-6 md:py-40"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 space-y-4 text-center md:mb-24 md:space-y-6">
          <div className="flex items-center justify-center gap-4">
            <div className="bg-accentDark/20 dark:bg-accent/20 h-[1px] w-8 md:w-12"></div>
            <Sparkles className="text-accentDark dark:text-accent h-5 w-5 animate-pulse md:h-6 md:w-6" />
            <div className="bg-accentDark/20 dark:bg-accent/20 h-[1px] w-8 md:w-12"></div>
          </div>
          <h2 className="font-serif text-4xl tracking-tight text-slate-900 italic md:text-9xl dark:text-white">
            Waktu & Tempat
          </h2>
          <p className="mx-auto max-w-2xl px-4 text-base font-light text-balance text-slate-500 italic md:text-xl dark:text-slate-400">
            {config.text.invitation}
          </p>
        </div>
        <div className="editorial-card dark:bg-darkSurface relative mb-16 overflow-hidden rounded-[1.75rem] bg-white p-8 text-center md:mb-20 md:rounded-[2.75rem] md:p-14">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-accent/10 blur-3xl"></div>
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-accentDark/10 blur-3xl dark:bg-accent/5"></div>

          <div className="relative z-10 mb-8 space-y-3 md:mb-12 md:space-y-5">
            <span className="tracking-luxury text-accentDark dark:text-accent text-[9px] font-bold uppercase md:text-[11px]">
              Our Sacred Day
            </span>
            <h3 className="font-serif text-4xl leading-tight tracking-tight text-slate-900 italic md:text-7xl dark:text-white">
              Akad & Resepsi
            </h3>
          </div>

          <div className="relative z-10 grid gap-5 md:grid-cols-2 md:gap-8">
            {(["akad", "resepsi"] as const).map((type) => {
              const ev = config.events[type];
              return (
                <div
                  key={type}
                  className="group relative flex flex-col items-center gap-6 rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl md:rounded-[2rem] md:p-10 dark:border-white/5 dark:bg-white/[0.03]"
                >
                  <div className="bg-accentDark/10 dark:bg-accent/10 text-accentDark dark:text-accent flex h-14 w-14 items-center justify-center rounded-2xl border border-white/60 shadow-sm md:h-16 md:w-16 md:rounded-3xl dark:border-white/5">
                    {type === "akad" ? (
                      <Heart className="h-6 w-6 fill-current md:h-7 md:w-7" />
                    ) : (
                      <Sparkles className="h-6 w-6 md:h-7 md:w-7" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="tracking-luxury text-accentDark dark:text-accent text-[9px] font-bold uppercase md:text-[10px]">
                      {type === "akad" ? "Momen Suci" : "Syukuran Cinta"}
                    </p>
                    <h4 className="font-serif text-3xl leading-tight text-slate-900 italic md:text-5xl dark:text-white">
                      {ev.title}
                    </h4>
                  </div>

                  <div className="w-full space-y-5 border-t border-slate-200/70 pt-6 dark:border-white/10">
                    <div className="flex flex-col items-center justify-center gap-3 font-serif text-xl text-slate-700 italic md:text-2xl dark:text-slate-100">
                      <div className="flex items-center gap-3 md:gap-4">
                        <Calendar className="text-accentDark dark:text-accent h-5 w-5 md:h-6 md:w-6" />
                        <span>
                          {ev.day}, {ev.date}
                        </span>
                      </div>
                    </div>
                    <div className="tracking-editorial flex items-center justify-center gap-3 text-[11px] font-bold text-slate-400 uppercase md:gap-4 md:text-[12px] dark:text-slate-500">
                      <Clock className="text-accentDark dark:text-accent h-4 w-4 md:h-5 md:w-5" />
                      <span>
                        {ev.startTime} — {ev.endTime} WIB
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="editorial-card rounded-[1.75rem] p-8 md:rounded-[2.75rem] md:p-14">
          <div className="flex flex-col justify-between gap-8 md:gap-12 lg:flex-row lg:items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-5 md:items-center md:gap-8">
                <div className="text-accentDark dark:text-accent flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 shadow-lg md:h-20 md:w-20 md:rounded-3xl dark:border-white/10 dark:bg-white/5">
                  <MapPin className="h-8 w-8 md:h-10 md:w-10" />
                </div>
                <div className="space-y-1 md:space-y-2">
                  <h4 className="font-serif text-3xl leading-tight tracking-tight text-slate-900 italic md:text-6xl dark:text-white">
                    {config.venue.name}
                  </h4>
                  <p className="text-base leading-snug font-light text-slate-500 italic md:text-2xl dark:text-slate-400">
                    {config.venue.address}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row md:gap-5 lg:w-auto">
              <button
                onClick={copyToClipboard}
                className="tracking-editorial flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 px-6 py-4 text-[10px] font-bold text-slate-700 uppercase transition-all hover:bg-slate-50 sm:w-1/2 md:gap-4 md:rounded-[2rem] md:px-10 md:py-5 md:text-[11px] lg:w-auto dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500 md:h-5 md:w-5" />
                ) : (
                  <Copy className="text-accentDark dark:text-accent h-4 w-4 md:h-5 md:w-5" />
                )}
                {copied ? "Alamat Disalin" : "Salin Alamat"}
              </button>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${config.venue.latitude},${config.venue.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary dark:text-primary tracking-editorial flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-[10px] font-bold text-white uppercase transition-all hover:shadow-2xl sm:w-1/2 md:gap-4 md:rounded-[2rem] md:px-12 md:py-5 md:text-[11px] lg:w-auto dark:bg-white"
              >
                <ExternalLink className="h-4 w-4 md:h-5 md:w-5" /> Buka Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetails;
