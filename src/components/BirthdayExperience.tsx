import React, { useState, useEffect } from 'react';
import {
  BirthdayConfig,
  ExperienceStepId,
  PhotoMemory,
} from '../types/birthday';
import {
  createMemorySceneDataUri,
  formatOrdinalAge,
  getActiveExperienceSteps,
} from '../utils/birthdayLogic';
import {
  AnywhereDoorInteractive,
  CharacterAvatar,
  DoraBellBadge,
  GadgetIllustration,
} from './DoraemonIllustrations';
import { playBellChime } from '../utils/soundEffects';
import { BackgroundMusicPlayer } from './BackgroundMusicPlayer';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  X,
  Gift,
  Heart,
  Calendar,
} from 'lucide-react';

interface BirthdayExperienceProps {
  config: BirthdayConfig;
  activeStepId: ExperienceStepId;
  onStepChange: (stepId: ExperienceStepId) => void;
  onTriggerConfetti: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isMusicPlaying?: boolean;
  onToggleMusic?: () => void;
}

export const BirthdayExperience: React.FC<BirthdayExperienceProps> = ({
  config,
  activeStepId,
  onStepChange,
  onTriggerConfetti,
  isFullscreen = false,
  onToggleFullscreen,
  isMusicPlaying: externalMusicPlaying,
  onToggleMusic: externalToggleMusic,
}) => {
  const steps = getActiveExperienceSteps(config.sections);
  const currentStepIndex = Math.max(
    0,
    steps.findIndex((s) => s.id === activeStepId)
  );
  const currentStep = steps[currentStepIndex] || steps[0];

  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const [internalMusicPlaying, setInternalMusicPlaying] = useState(true);
  const isMusicPlaying =
    typeof externalMusicPlaying === 'boolean'
      ? externalMusicPlaying
      : internalMusicPlaying;
  const handleToggleMusic = () => {
    if (externalToggleMusic) {
      externalToggleMusic();
    } else {
      setInternalMusicPlaying((prev) => !prev);
    }
  };

  const [unlockedGadgetIds, setUnlockedGadgetIds] = useState<string[]>([
    config.gadgetSurprises[0]?.id || 'gad-1',
  ]);
  const [selectedMemory, setSelectedMemory] = useState<PhotoMemory | null>(null);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [brokenImageIds, setBrokenImageIds] = useState<Record<string, boolean>>({});

  // Keep activeStepId valid if user hides the currently viewed section in editor
  useEffect(() => {
    if (!steps.some((s) => s.id === activeStepId) && steps.length > 0) {
      onStepChange(steps[0].id);
    }
  }, [steps, activeStepId, onStepChange]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      playBellChime('bell', config.appearance.soundChimes);
      onStepChange(nextStep.id);
      if (nextStep.id === 'finale') {
        onTriggerConfetti();
      }
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      onStepChange(prevStep.id);
    }
  };

  const handleReplay = () => {
    setIsDoorOpen(false);
    setCandlesBlown(false);
    playBellChime('door', config.appearance.soundChimes);
    onStepChange(steps[0].id);
  };

  const toggleGadget = (id: string) => {
    playBellChime('bell', config.appearance.soundChimes);
    setUnlockedGadgetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBlowCandles = () => {
    setCandlesBlown(true);
    playBellChime('celebrate', config.appearance.soundChimes);
    onTriggerConfetti();
  };

  // Subtle accent highlight mapping while keeping 85-90% UI sky-blue and white
  const accentButtonStyles: Record<BirthdayConfig['appearance']['accent'], string> = {
    'dora-blue': 'bg-[#168DCE] hover:bg-[#1276AD] text-white',
    'bell-gold': 'bg-[#FFD84D] hover:bg-[#F5CA2E] text-[#183247]',
    'collar-red': 'bg-[#F04444] hover:bg-[#D93636] text-white',
    'dorami-sky': 'bg-[#64C8FF] hover:bg-[#4BB8F5] text-[#183247]',
  };

  const layoutContainerStyles: Record<BirthdayConfig['appearance']['layout'], string> = {
    'classic-pocket':
      'bg-white border-2 border-[#64C8FF]/60 shadow-[0_18px_48px_rgba(22,141,206,0.12)] rounded-[32px]',
    'anywhere-storybook':
      'bg-gradient-to-b from-white via-white to-[#EAF7FF] border-2 border-[#FF85B3]/60 shadow-[0_18px_48px_rgba(24,50,71,0.12)] rounded-[32px]',
    'starlight-cloud':
      'bg-white/95 border-2 border-[#FFD84D] shadow-[0_18px_48px_rgba(22,141,206,0.14)] rounded-[32px]',
  };

  const progressPercentage = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div
      className={`w-full flex flex-col justify-between transition-all duration-200 ${
        layoutContainerStyles[config.appearance.layout]
      } ${isFullscreen ? 'min-h-[68vh] max-w-4xl mx-auto p-6 sm:p-8' : 'min-h-[540px] p-5 sm:p-6'}`}
    >
      {/* Top Microsite Header: Step Progress & Corner Music Player + Controls */}
      <div className="space-y-3 pb-4 border-b border-[#EAF7FF]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {config.appearance.showDoraemonBellBadge && <DoraBellBadge size={30} />}
            <div className="truncate">
              <span className="text-xs font-semibold text-[#168DCE] block">
                {config.recipientName || 'Birthday'}&apos;s Pocket World ·{' '}
                <span className="font-mono-num">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
              </span>
              <h2 className="font-display text-sm sm:text-base font-bold text-[#183247] truncate">
                {currentStep.emoji} {currentStep.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <BackgroundMusicPlayer
              music={
                config.music || {
                  source: 'youtube',
                  trackTitle: 'Doraemon Cartoon Theme (Original)',
                  youtubeUrl: 'https://www.youtube.com/watch?v=iwncGYFPxmU',
                  youtubeVideoId: 'iwncGYFPxmU',
                  volume: 75,
                }
              }
              isPlaying={isMusicPlaying}
              onTogglePlay={handleToggleMusic}
            />

            <span className="text-xs font-mono-num text-[#168DCE] font-semibold hidden sm:inline">
              {progressPercentage}%
            </span>
            {onToggleFullscreen && (
              <button
                type="button"
                onClick={onToggleFullscreen}
                aria-label={
                  isFullscreen ? 'Exit Fullscreen Preview' : 'Open Fullscreen Experience'
                }
                className="p-2 rounded-xl bg-[#EAF7FF] hover:bg-[#64C8FF]/30 text-[#183247] transition-colors cursor-pointer"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Smooth Progress Bar */}
        <div className="w-full h-2 bg-[#EAF7FF] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#64C8FF] via-[#168DCE] to-[#FFD84D] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Interactive Step Selector Bar */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Birthday Experience Steps"
        >
          {steps.map((step) => {
            const isActive = step.id === currentStep.id;
            return (
              <button
                key={step.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  playBellChime('bell', config.appearance.soundChimes);
                  onStepChange(step.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#168DCE] text-white shadow-sm'
                    : 'bg-[#EAF7FF]/80 text-[#183247]/75 hover:bg-[#EAF7FF] hover:text-[#183247]'
                }`}
              >
                <span className="font-mono-num mr-1">{step.index}.</span>
                {step.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Content Viewport */}
      <div className="py-4 flex-1 flex flex-col justify-center">
        {/* STEP 1: WELCOME & ANYWHERE DOOR */}
        {currentStep.id === 'welcome' && (
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-[#168DCE]">
              <span>Special Delivery from {config.senderName || 'Someone Special'}</span>
              <span aria-hidden="true">·</span>
              <span>{config.relationship || 'Friend'}</span>
            </div>

            <h3
              className="font-display text-2xl sm:text-3xl font-bold text-[#183247]"
              style={{ textWrap: 'balance' }}
            >
              A Magical Door Just Appeared for{' '}
              <span className="text-[#168DCE]">
                {config.recipientName || 'You'}
              </span>
              ! 🚪✨
            </h3>

            <p className="text-xs sm:text-sm text-[#183247]/80 leading-relaxed">
              Reach out and open the Anywhere Door below—or click Next Step—to step
              inside a little sky-blue world filled with your favorite memories,
              wishes, and 22nd-century surprises.
            </p>

            <AnywhereDoorInteractive
              isOpen={isDoorOpen}
              onToggleOpen={() => {
                const nextState = !isDoorOpen;
                setIsDoorOpen(nextState);
                playBellChime('door', config.appearance.soundChimes);
              }}
              recipientName={config.recipientName || 'Friend'}
            />

            {isDoorOpen && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className={`px-6 py-3 rounded-2xl font-display font-semibold text-sm shadow-md transition-transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer ${
                    accentButtonStyles[config.appearance.accent]
                  }`}
                >
                  Step Through the Anywhere Door →
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: MILESTONE & PERSONAL MESSAGE */}
        {currentStep.id === 'milestone' && (
          <div className="space-y-6 max-w-2xl mx-auto w-full">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#168DCE]">
                <span>🎉 Official Celebration Milestone</span>
                {config.nickname && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>AKA &ldquo;{config.nickname}&rdquo;</span>
                  </>
                )}
              </div>

              <h3
                className="font-display text-3xl sm:text-4xl font-bold text-[#183247]"
                style={{ textWrap: 'balance' }}
              >
                {config.headline ||
                  `Happy Birthday, ${config.recipientName || 'Friend'}! 🎂`}
              </h3>
            </div>

            {/* Milestone Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-[#EAF7FF] rounded-2xl p-4 border border-[#64C8FF]/50 text-center">
                <span className="text-xs text-[#183247]/70 block">Milestone Level</span>
                <span className="font-display text-2xl font-bold text-[#168DCE] font-mono-num mt-0.5 block">
                  {formatOrdinalAge(config.age)} Birthday
                </span>
              </div>
              <div className="bg-[#EAF7FF] rounded-2xl p-4 border border-[#64C8FF]/50 text-center">
                <span className="text-xs text-[#183247]/70 block">Celebration Date</span>
                <span className="font-display text-base font-bold text-[#183247] font-mono-num mt-1.5 flex items-center justify-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#168DCE]" />
                  {config.birthdayDate || 'Today'}
                </span>
              </div>
              <div className="bg-[#EAF7FF] rounded-2xl p-4 border border-[#64C8FF]/50 text-center">
                <span className="text-xs text-[#183247]/70 block">Created With Love By</span>
                <span className="font-display text-base font-bold text-[#183247] mt-1.5 block truncate">
                  {config.senderName || 'Your Best Friend'}
                </span>
              </div>
            </div>

            {/* Personal Note Card */}
            <div className="bg-[#EAF7FF]/60 rounded-3xl p-6 sm:p-7 border border-[#64C8FF]/60 relative">
              <div className="flex items-start gap-4">
                <DoraBellBadge size={40} className="shrink-0 mt-0.5" />
                <div className="space-y-3">
                  <h4 className="font-display text-lg font-bold text-[#183247]">
                    A Personal Birthday Note for {config.recipientName || 'You'} 💙
                  </h4>
                  <p className="text-sm sm:text-base text-[#183247]/85 leading-relaxed whitespace-pre-line">
                    {config.personalMessage}
                  </p>
                  <div className="pt-2 text-xs font-semibold text-[#168DCE]">
                    — {config.senderName} ({config.relationship})
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PHOTO & MEMORY GALLERY */}
        {currentStep.id === 'memories' && (
          <div className="space-y-5 w-full">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-[#168DCE]">
                  Time Machine Memory Album 📸
                </span>
                <h3 className="font-display text-2xl font-bold text-[#183247]">
                  Our Favorite Moments & Snapshots
                </h3>
              </div>
              <span className="text-xs text-[#183247]/70 font-mono-num">
                {config.memories.length}{' '}
                {config.memories.length === 1 ? 'memory' : 'memories'} saved · Click any
                photo to enlarge
              </span>
            </div>

            {config.memories.length === 0 ? (
              <div className="bg-[#EAF7FF] rounded-3xl p-10 text-center border border-dashed border-[#64C8FF]">
                <p className="font-display text-lg font-bold text-[#183247]">
                  No photo memories added yet ☁️
                </p>
                <p className="text-xs text-[#183247]/70 mt-1">
                  Open the &ldquo;Photos &amp; Memories&rdquo; tab in the editor to upload
                  photos or add anime sky scenes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {config.memories.map((memory, idx) => {
                  const fallbackSrc = createMemorySceneDataUri(
                    memory.scenePreset || 'sunset-hill'
                  );
                  const imgSrc = brokenImageIds[memory.id]
                    ? fallbackSrc
                    : memory.imageUrl || fallbackSrc;

                  return (
                    <div
                      key={memory.id}
                      onClick={() => setSelectedMemory(memory)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedMemory(memory);
                        }
                      }}
                      className="group bg-[#EAF7FF]/50 hover:bg-[#EAF7FF] rounded-2xl overflow-hidden border border-[#64C8FF]/50 transition-all cursor-pointer flex flex-col"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#D0EEFF]">
                        <img
                          src={imgSrc}
                          alt={memory.caption || `Birthday memory ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setBrokenImageIds((prev) => ({ ...prev, [memory.id]: true }))
                          }
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-xs text-[#168DCE] font-medium">
                            <span className="font-mono-num">0{idx + 1}</span> ·{' '}
                            {memory.dateLabel || 'Cherished Memory'}
                          </div>
                          <h4 className="font-display font-bold text-base text-[#183247] mt-0.5">
                            {memory.caption}
                          </h4>
                          {memory.story && (
                            <p className="text-xs text-[#183247]/75 mt-1 line-clamp-2 leading-relaxed">
                              {memory.story}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: 4D POCKET GADGET SURPRISES & FUNNY MOMENTS */}
        {currentStep.id === 'surprises' && (
          <div className="space-y-7 w-full">
            {config.sections.showGadgetSurprises && (
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-[#168DCE]">
                    Interactive Four-Dimensional Pocket 🎁
                  </span>
                  <h3 className="font-display text-2xl font-bold text-[#183247]">
                    Click a 22nd-Century Gadget to Unlock Your Surprises
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {config.gadgetSurprises.map((item) => {
                    const isUnlocked = unlockedGadgetIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleGadget(item.id)}
                        className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                          isUnlocked
                            ? 'bg-[#EAF7FF] border-[#168DCE] shadow-sm'
                            : 'bg-white hover:bg-[#EAF7FF]/50 border-[#64C8FF]/50'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="p-2.5 rounded-2xl bg-white border border-[#64C8FF]/40 shrink-0">
                            <GadgetIllustration
                              gadget={item.gadget}
                              className="w-10 h-10"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-[#168DCE] truncate">
                                {item.gadgetName}
                              </span>
                              <span className="text-[11px] font-semibold text-[#183247]/65 shrink-0">
                                {isUnlocked ? '🔓 Unlocked' : '🔒 Tap to Open'}
                              </span>
                            </div>
                            <h4 className="font-display font-bold text-base text-[#183247] mt-0.5">
                              {isUnlocked ? item.surpriseTitle : 'Mystery Birthday Gadget'}
                            </h4>
                            {isUnlocked ? (
                              <div className="mt-2 space-y-1.5">
                                <p className="text-xs text-[#183247]/80 leading-relaxed">
                                  {item.surpriseMessage}
                                </p>
                                <p className="text-[11px] font-semibold text-[#168DCE]">
                                  ✨ {item.unlockedHint}
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs text-[#183247]/60 mt-1">
                                Reach into the 4D Pocket to reveal this birthday gift!
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {config.sections.showFunnyMoments && config.funnyMoments.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-[#EAF7FF]">
                <div>
                  <span className="text-xs font-semibold text-[#168DCE]">
                    Classic Episode Highlights 😄
                  </span>
                  <h4 className="font-display text-lg font-bold text-[#183247]">
                    Unforgettable &amp; Funny Moments
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {config.funnyMoments.map((moment) => (
                    <div
                      key={moment.id}
                      className="bg-[#EAF7FF]/60 rounded-2xl p-4 border border-[#64C8FF]/40 space-y-1.5"
                    >
                      <div className="text-xs text-[#168DCE] font-medium">
                        {moment.emoji} {moment.episodeTag}
                      </div>
                      <h5 className="font-display font-bold text-sm text-[#183247]">
                        {moment.title}
                      </h5>
                      <p className="text-xs text-[#183247]/75 leading-relaxed">
                        {moment.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: HEARTFELT LETTER & FRIENDS' WISHES */}
        {currentStep.id === 'letter' && (
          <div className="space-y-7 w-full">
            {config.sections.showHeartfeltLetter && (
              <div className="bg-[#EAF7FF]/70 rounded-3xl p-6 sm:p-8 border border-[#64C8FF]/60 space-y-4">
                <div className="flex items-center justify-between border-b border-[#64C8FF]/30 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-5 h-5 text-[#F04444] fill-[#F04444]" />
                    <span className="font-display font-bold text-lg text-[#183247]">
                      {config.letterGreeting || `Dearest ${config.recipientName},`}
                    </span>
                  </div>
                  <span className="text-xs text-[#168DCE] font-semibold">
                    Sealed with a Golden Bell 🔔
                  </span>
                </div>

                <p className="text-sm sm:text-base text-[#183247]/85 leading-relaxed whitespace-pre-line">
                  {config.letterBody}
                </p>

                <div className="pt-2 text-right font-display font-bold text-sm text-[#168DCE]">
                  {config.letterSignOff}
                </div>
              </div>
            )}

            {config.sections.showFriendsWishes && config.wishes.length > 0 && (
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-semibold text-[#168DCE]">
                    Messages from the Crew 🌟
                  </span>
                  <h4 className="font-display text-lg font-bold text-[#183247]">
                    Birthday Wishes &amp; Cheers
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {config.wishes.map((wish) => (
                    <div
                      key={wish.id}
                      className="bg-white rounded-2xl p-4 border border-[#64C8FF]/50 flex items-start gap-3.5"
                    >
                      <CharacterAvatar
                        character={wish.character}
                        className="w-11 h-11 shrink-0"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-bold text-[#183247] truncate">
                            {wish.senderName}
                          </span>
                          <span aria-hidden="true" className="text-[#183247]/40">
                            ·
                          </span>
                          <span className="text-[#168DCE] truncate">
                            {wish.roleLabel}
                          </span>
                        </div>
                        <p className="text-xs text-[#183247]/80 leading-relaxed">
                          {wish.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 6: FINALE & MAKE A WISH CAKE */}
        {currentStep.id === 'finale' && (
          <div className="text-center space-y-6 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#168DCE]">
              <span>🥳 Grand Birthday Finale</span>
              <span aria-hidden="true">·</span>
              <span>{formatOrdinalAge(config.age)} Milestone</span>
            </div>

            <h3
              className="font-display text-2xl sm:text-4xl font-bold text-[#183247]"
              style={{ textWrap: 'balance' }}
            >
              {candlesBlown
                ? `Yay!! Happy Birthday, ${config.recipientName || 'Friend'}! 🎉💙`
                : config.finalHeadline || 'Make a Wish & Blow Out the Candles! 🎂✨'}
            </h3>

            <p className="text-sm sm:text-base text-[#183247]/80 leading-relaxed">
              {candlesBlown
                ? 'Your wish has been tucked safely into the 4D Pocket for the year ahead!'
                : config.finalSubtext}
            </p>

            {/* Interactive Cake SVG */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={handleBlowCandles}
                aria-label="Blow out the birthday candles and make a wish"
                className="group focus:outline-none focus-visible:ring-4 focus-visible:ring-[#64C8FF] rounded-3xl p-3 transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <svg
                  width="260"
                  height="210"
                  viewBox="0 0 260 210"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Plate */}
                  <ellipse
                    cx="130"
                    cy="182"
                    rx="110"
                    ry="18"
                    fill="#EAF7FF"
                    stroke="#168DCE"
                    strokeWidth="3"
                  />
                  {/* Cake Sponge */}
                  <rect
                    x="48"
                    y="92"
                    width="164"
                    height="84"
                    rx="18"
                    fill="#FFF9EB"
                    stroke="#183247"
                    strokeWidth="3.5"
                  />
                  {/* White Cream Frosting */}
                  <path
                    d="M48 112 Q68 130 89 112 Q110 130 130 112 Q150 130 171 112 Q192 130 212 112 L212 92 L48 92 Z"
                    fill="#FFFFFF"
                    stroke="#183247"
                    strokeWidth="3.5"
                  />
                  {/* Red Collar Ribbon & Golden Bell on Cake */}
                  <rect x="48" y="144" width="164" height="16" fill="#F04444" />
                  <circle
                    cx="130"
                    cy="152"
                    r="13"
                    fill="#FFD84D"
                    stroke="#183247"
                    strokeWidth="2.5"
                  />
                  <circle cx="130" cy="155" r="3" fill="#183247" />
                  {/* 3 Candles */}
                  <rect
                    x="86"
                    y="48"
                    width="12"
                    height="44"
                    rx="4"
                    fill="#64C8FF"
                    stroke="#183247"
                    strokeWidth="2.5"
                  />
                  <rect
                    x="124"
                    y="40"
                    width="12"
                    height="52"
                    rx="4"
                    fill="#FFD84D"
                    stroke="#183247"
                    strokeWidth="2.5"
                  />
                  <rect
                    x="162"
                    y="48"
                    width="12"
                    height="44"
                    rx="4"
                    fill="#F04444"
                    stroke="#183247"
                    strokeWidth="2.5"
                  />

                  {/* Candle Flames (extinguished when candlesBlown is true) */}
                  {!candlesBlown ? (
                    <g className="animate-pulse">
                      <path
                        d="M92 24 C100 34 100 42 92 46 C84 42 84 34 92 24 Z"
                        fill="#FFD84D"
                        stroke="#F04444"
                        strokeWidth="2"
                      />
                      <path
                        d="M130 16 C138 26 138 34 130 38 C122 34 122 26 130 16 Z"
                        fill="#FFD84D"
                        stroke="#F04444"
                        strokeWidth="2"
                      />
                      <path
                        d="M168 24 C176 34 176 42 168 46 C160 42 160 34 168 24 Z"
                        fill="#FFD84D"
                        stroke="#F04444"
                        strokeWidth="2"
                      />
                    </g>
                  ) : (
                    <g stroke="#64C8FF" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M92 40 Q86 28 96 18" />
                      <path d="M130 32 Q124 20 134 10" />
                      <path d="M168 40 Q162 28 172 18" />
                    </g>
                  )}
                </svg>
              </button>

              <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleBlowCandles}
                  className={`px-6 py-3 rounded-2xl font-display font-semibold text-sm shadow-md transition-transform active:scale-95 flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                    accentButtonStyles[config.appearance.accent]
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {candlesBlown
                    ? 'Ring Bell & Celebrate Again 🎉'
                    : 'Blow Out the Candles 🕯️✨'}
                </button>

                <button
                  type="button"
                  onClick={handleReplay}
                  className="px-5 py-3 rounded-2xl bg-[#EAF7FF] hover:bg-[#64C8FF]/30 text-[#183247] font-display font-semibold text-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Replay Experience
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Step Navigation Footer */}
      <div className="pt-4 border-t border-[#EAF7FF] flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className="px-4 py-2.5 rounded-xl bg-[#EAF7FF] hover:bg-[#64C8FF]/30 disabled:opacity-40 disabled:pointer-events-none text-[#183247] font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="text-xs text-[#183247]/65 hidden sm:flex items-center gap-1.5">
          <Gift className="w-3.5 h-3.5 text-[#168DCE]" />
          <span>Built with DoraPocket Studio</span>
        </div>

        {currentStepIndex < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer ${
              accentButtonStyles[config.appearance.accent]
            }`}
          >
            Next Step
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleReplay}
            className="px-5 py-2.5 rounded-xl bg-[#168DCE] hover:bg-[#1276AD] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Start Over
          </button>
        )}
      </div>

      {/* Lightbox Modal for Enlarged Photo Memory */}
      {selectedMemory && (
        <div
          className="fixed inset-0 z-50 bg-[#183247]/70 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={selectedMemory.caption}
          onClick={() => setSelectedMemory(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border-2 border-[#64C8FF] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] bg-[#EAF7FF]">
              <img
                src={
                  brokenImageIds[selectedMemory.id]
                    ? createMemorySceneDataUri(
                        selectedMemory.scenePreset || 'sunset-hill'
                      )
                    : selectedMemory.imageUrl
                }
                alt={selectedMemory.caption}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedMemory(null)}
                aria-label="Close photo view"
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-[#183247] shadow-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-2">
              <div className="text-xs font-semibold text-[#168DCE]">
                {selectedMemory.dateLabel}
              </div>
              <h4 className="font-display text-xl font-bold text-[#183247]">
                {selectedMemory.caption}
              </h4>
              <p className="text-sm text-[#183247]/80 leading-relaxed">
                {selectedMemory.story}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
