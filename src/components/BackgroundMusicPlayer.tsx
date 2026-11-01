import React, { useEffect, useRef, useState } from 'react';
import { MusicConfig } from '../types/birthday';
import { Volume2, VolumeX, Play, Pause, Tv, ExternalLink } from 'lucide-react';

interface BackgroundMusicPlayerProps {
  music: MusicConfig;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

// Melodic note sequences (Hz) for built-in Doraemon-inspired background loops
const MELODY_PRESETS: Record<
  'synth-dora-march' | 'synth-music-box' | 'synth-birthday-bell',
  { notes: number[]; tempoMs: number; wave: OscillatorType }
> = {
  // Jaunty cartoon march inspired by Doraemon no Uta
  'synth-dora-march': {
    notes: [
      392.0, 523.25, 523.25, 659.25, 783.99, 659.25, 523.25, 587.33,
      659.25, 587.33, 523.25, 440.0, 493.88, 587.33, 392.0, 523.25,
    ],
    tempoMs: 280,
    wave: 'triangle',
  },
  // Gentle dreamy Anywhere Door music box
  'synth-music-box': {
    notes: [
      523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 659.25, 587.33,
      523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25,
    ],
    tempoMs: 380,
    wave: 'sine',
  },
  // Happy Birthday Golden Bell melody
  'synth-birthday-bell': {
    notes: [
      392.0, 392.0, 440.0, 392.0, 523.25, 493.88, 392.0, 392.0,
      440.0, 392.0, 587.33, 523.25, 392.0, 392.0, 783.99, 659.25,
      523.25, 493.88, 440.0, 698.46, 698.46, 659.25, 523.25, 587.33, 523.25,
    ],
    tempoMs: 320,
    wave: 'sine',
  },
};

export const BackgroundMusicPlayer: React.FC<BackgroundMusicPlayerProps> = ({
  music,
  isPlaying,
  onTogglePlay,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [showVideoPopover, setShowVideoPopover] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const safeVolume = Math.max(0, Math.min(100, music.volume ?? 75));
  const effectiveVolume = isMuted ? 0 : safeVolume;
  const videoId = music.youtubeVideoId || 'iwncGYFPxmU';

  // 1. Handle Custom Uploaded Audio (<audio>) playback
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    audioEl.volume = effectiveVolume / 100;

    if (music.source === 'custom-upload' && music.customAudioDataUrl && isPlaying) {
      audioEl.play().catch(() => {
        // Autoplay blocked until interaction
      });
    } else {
      audioEl.pause();
    }
  }, [music.source, music.customAudioDataUrl, isPlaying, effectiveVolume]);

  // 2. Handle Built-In Synthesized Doraemon Melodies (Web Audio API loop)
  // Strictly only runs when one of the synth-* presets is explicitly selected,
  // never when 'youtube' (Doraemon BGM) is active.
  useEffect(() => {
    const isSynthSource =
      music.source === 'synth-dora-march' ||
      music.source === 'synth-music-box' ||
      music.source === 'synth-birthday-bell';

    if (!isSynthSource || !isPlaying || effectiveVolume === 0) {
      return;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    let ctx: AudioContext | null = null;
    try {
      ctx = new AudioCtx();
    } catch {
      return;
    }

    const preset = MELODY_PRESETS[music.source as keyof typeof MELODY_PRESETS];
    if (!preset) return;
    let stepIndex = 0;

    const playStep = () => {
      if (!ctx || ctx.state === 'closed') return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const freq = preset.notes[stepIndex % preset.notes.length];
      stepIndex += 1;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = preset.wave;
        osc.frequency.setValueAtTime(freq, now);

        const peakGain = (effectiveVolume / 100) * 0.12;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.001, peakGain), now + 0.03);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          now + (preset.tempoMs / 1000) * 0.9
        );

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + (preset.tempoMs / 1000) * 0.92);
      } catch {
        // Ignore audio scheduling error
      }
    };

    playStep();
    const intervalId = window.setInterval(playStep, preset.tempoMs);

    // Unlock suspended AudioContext automatically on first user gesture if browser blocked initial autoplay
    const unlockAudio = () => {
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    };
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      if (ctx && ctx.state !== 'closed') {
        ctx.close().catch(() => {});
      }
    };
  }, [music.source, isPlaying, effectiveVolume]);

  // 3. Control YouTube IFrame via postMessage API when play/pause/mute changes or on first user gesture
  useEffect(() => {
    if (music.source !== 'youtube') return;

    const syncYouTubePlayback = () => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      try {
        const func = isPlaying ? 'playVideo' : 'pauseVideo';
        win.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*');
        win.postMessage(
          JSON.stringify({
            event: 'command',
            func: isMuted || effectiveVolume === 0 ? 'mute' : 'unMute',
            args: [],
          }),
          '*'
        );
        win.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'setVolume',
            args: [effectiveVolume],
          }),
          '*'
        );
      } catch {
        // Ignore cross-origin postMessage errors
      }
    };

    syncYouTubePlayback();

    const handleUserGesture = () => {
      if (isPlaying) {
        syncYouTubePlayback();
      }
    };

    window.addEventListener('pointerdown', handleUserGesture, { passive: true });
    window.addEventListener('keydown', handleUserGesture, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
    };
  }, [music.source, isPlaying, effectiveVolume, isMuted]);

  const shortTrackLabel =
    music.source === 'youtube'
      ? 'Doraemon BGM'
      : music.source === 'synth-dora-march'
        ? 'Pocket March'
        : music.source === 'synth-music-box'
          ? 'Music Box'
          : music.source === 'synth-birthday-bell'
            ? 'Birthday Bell'
            : music.trackTitle || 'Custom Audio';

  return (
    <div className="relative flex items-center gap-1 sm:gap-1.5">
      {/* Corner Play / Pause (On / Off) Music Toggle Button */}
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={
          isPlaying ? 'Turn off background music' : 'Turn on background music'
        }
        aria-pressed={isPlaying}
        title={
          isPlaying
            ? `Music is Playing (${music.trackTitle}) — Click to Turn Off`
            : `Music is Off (${music.trackTitle}) — Click to Play`
        }
        className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
          isPlaying
            ? 'bg-[#FFD84D] text-[#183247] border-[#183247]/30 shadow-xs'
            : 'bg-[#EAF7FF] hover:bg-[#64C8FF]/30 text-[#183247] border-[#64C8FF]/60'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-current shrink-0" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current shrink-0" />
        )}
        <span className="sm:hidden">
          {isPlaying ? '🎵 BGM' : '🔇 Off'}
        </span>
        <span className="hidden sm:inline">
          {isPlaying
            ? `🎵 Music On · ${shortTrackLabel}`
            : `🔇 Music Off · ${shortTrackLabel}`}
        </span>
      </button>

      {/* Mute / Unmute Toggle */}
      <button
        type="button"
        onClick={() => setIsMuted((prev) => !prev)}
        aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
        className="p-2 rounded-xl bg-[#EAF7FF] hover:bg-[#64C8FF]/30 text-[#183247] transition-colors cursor-pointer"
      >
        {isMuted || effectiveVolume === 0 ? (
          <VolumeX className="w-3.5 h-3.5 text-[#F04444]" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-[#168DCE]" />
        )}
      </button>

      {/* Mini YouTube Player Popover Toggle when source is YouTube */}
      {music.source === 'youtube' && (
        <button
          type="button"
          onClick={() => setShowVideoPopover((prev) => !prev)}
          aria-label={
            showVideoPopover ? 'Hide YouTube mini player' : 'Show YouTube mini player'
          }
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            showVideoPopover
              ? 'bg-[#168DCE] text-white'
              : 'bg-[#EAF7FF] hover:bg-[#64C8FF]/30 text-[#183247]'
          }`}
          title="Toggle YouTube Cartoon Music Mini-Player"
        >
          <Tv className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Hidden or Mini-Popover YouTube Embed for Doraemon Cartoon Music */}
      {music.source === 'youtube' && (isPlaying || showVideoPopover) && (
        <div
          className={
            showVideoPopover
              ? 'absolute right-0 top-11 z-40 w-[min(18rem,calc(100vw-2rem))] bg-white rounded-2xl border-2 border-[#64C8FF] shadow-xl p-2.5 space-y-2'
              : 'sr-only pointer-events-none w-1 h-1 overflow-hidden'
          }
        >
          {showVideoPopover && (
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#183247] px-1">
              <span className="truncate">{music.trackTitle}</span>
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#168DCE] hover:underline inline-flex items-center gap-1 shrink-0"
              >
                YouTube <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-[#183247]">
            <iframe
              ref={iframeRef}
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=${
                isPlaying ? 1 : 0
              }&mute=${
                effectiveVolume === 0 ? 1 : 0
              }&loop=1&playlist=${videoId}&enablejsapi=1&rel=0`}
              title={music.trackTitle || 'Doraemon Cartoon Music'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* HTML5 Audio Element for Custom Uploaded Audio Files */}
      {music.source === 'custom-upload' && music.customAudioDataUrl && (
        <audio
          ref={audioRef}
          src={music.customAudioDataUrl}
          loop
          preload="auto"
          className="hidden"
        />
      )}
    </div>
  );
};
