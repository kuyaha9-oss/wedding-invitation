import { Music, Pause, Play } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

const MusicPlayer: React.FC<{ url: string; showControl?: boolean }> = ({
  url,
  showControl = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const play = useCallback(async () => {
    if (!audioRef.current || !url) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      setHasError(false);
    } catch {
      setIsPlaying(false);
      setHasError(true);
    }
  }, [url]);

  const toggle = () => {
    if (!audioRef.current || !url) return;
    if (audioRef.current.paused) {
      void play();
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const handlePlay = () => {
      void play();
    };
    window.addEventListener("play-wedding-music", handlePlay);
    return () => window.removeEventListener("play-wedding-music", handlePlay);
  }, [play]);

  useEffect(() => {
    setIsPlaying(false);
    setHasError(false);
    audioRef.current?.load();
  }, [url]);

  if (!url) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={url}
        loop
        preload="auto"
        className="hidden"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setHasError(true);
        }}
      />
      {showControl && (
        <button
          type="button"
          onClick={toggle}
          className="dark:bg-darkSurface/80 hover:text-accentDark dark:hover:text-accent fixed right-4 bottom-24 z-[110] flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/80 text-slate-700 shadow-2xl backdrop-blur-2xl transition-all hover:scale-105 active:scale-95 md:right-8 md:bottom-8 dark:border-white/10 dark:text-white"
          aria-label={isPlaying ? "Jeda musik" : "Putar musik"}
          title={
            hasError
              ? "Musik tidak dapat diputar"
              : isPlaying
                ? "Jeda musik"
                : "Putar musik"
          }
        >
          <Music className="absolute h-8 w-8 opacity-10" />
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="ml-0.5 h-5 w-5" />
          )}
        </button>
      )}
    </>
  );
};

export default MusicPlayer;
