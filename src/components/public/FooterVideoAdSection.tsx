'use client';

import React, { useState, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface FooterVideoAdSectionProps {
  videoSrc?: string;
}

export function FooterVideoAdSection({
  videoSrc = '/AiDigital.mp4'
}: FooterVideoAdSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAuditClick = () => {
    const text = encodeURIComponent(
      'Hello AI Digital team, I saw your promotional video on ANV Realty and would like a Free Project Audit for real estate digital marketing.'
    );
    window.open(`https://wa.me/919373020701?text=${text}`, '_blank');
  };

  const handleAdvertiseClick = () => {
    const text = encodeURIComponent(
      'Hello ANV Realty team, I would like to run our company promotional video ad in your website footer.'
    );
    window.open(`https://wa.me/919373020701?text=${text}`, '_blank');
  };

  return (
    <div className="w-full max-w-[260px] sm:max-w-[280px] lg:max-w-none rounded-xl sm:rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/40 transition-all p-3 sm:p-3.5 space-y-2.5 sm:space-y-3 shadow-xl">
      {/* Header Tag */}
      <div className="flex items-center justify-between gap-1.5 border-b border-zinc-800/80 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 font-black text-[9px] uppercase tracking-wider font-mono">
            Sponsored
          </span>
          <span className="text-xs font-bold text-white tracking-tight">AI Digital</span>
        </div>
        <button
          type="button"
          onClick={handleAdvertiseClick}
          className="text-[10px] text-zinc-500 hover:text-amber-400 transition cursor-pointer flex items-center gap-1 font-medium"
          title="Promote your company here"
        >
          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
          <span>Promote</span>
        </button>
      </div>

      {/* Video Player Box - Clean with zero text overlays */}
      <div className="relative w-full aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-md group/v">
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Floating Mini Controls - Sleek Icon-only Controls (No text on video) */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 z-10 pointer-events-auto">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-6 h-6 rounded-full bg-black/75 hover:bg-black text-white backdrop-blur-xs flex items-center justify-center border border-white/20 transition cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <Pause className="w-2.5 h-2.5 fill-white text-white" />
            ) : (
              <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
            )}
          </button>

          {/* Mute/Unmute - Icon Only */}
          <button
            type="button"
            onClick={toggleSound}
            className="w-6 h-6 rounded-full bg-black/75 hover:bg-black text-white backdrop-blur-xs flex items-center justify-center border border-white/20 transition cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? (
              <VolumeX className="w-2.5 h-2.5 text-zinc-300" />
            ) : (
              <Volume2 className="w-2.5 h-2.5 text-emerald-400" />
            )}
          </button>
        </div>
      </div>

      {/* Description & Value Points */}
      <div className="space-y-1">
        <h4 className="text-xs font-bold text-white leading-tight">
          Digital Marketing Partner for Real Estate
        </h4>
        <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
          AI-driven Meta &amp; Google ads, 3D virtual walkthroughs &amp; automated buyer funnels.
        </p>
      </div>

      {/* Action Button */}
      <div className="pt-1.5 border-t border-zinc-800/80 flex items-center justify-between">
        <button
          type="button"
          onClick={handleAuditClick}
          className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-xs transition shadow-sm cursor-pointer active:scale-98"
        >
          <span>Get Free Project Audit</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-950 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
