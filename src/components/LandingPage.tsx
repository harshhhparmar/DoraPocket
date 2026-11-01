import React from 'react';
import {
  DoraBellBadge,
  DoraemonHeroArtwork,
  GadgetIllustration,
  CharacterAvatar,
} from './DoraemonIllustrations';
import { BirthdayConfig } from '../types/birthday';

interface LandingPageProps {
  config: BirthdayConfig;
  onStartBuilder: () => void;
  onExploreExperience: () => void;
  onSelectPresetAndBuild: (preset: 'nobita' | 'shizuka' | 'dorami' | 'best-friend') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  config,
  onStartBuilder,
  onExploreExperience,
  onSelectPresetAndBuild,
}) => {
  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="max-w-[1280px] mx-auto w-full px-4 sm:px-8 pt-6 pb-12 sm:pt-8 sm:pb-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, Subtitle & CTAs */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm font-semibold text-[#168DCE]">
              <span>22nd-Century Birthday Pocket Studio</span>
              <span aria-hidden="true">·</span>
              <span>No Coding Needed</span>
              <span aria-hidden="true">·</span>
              <span>Live Interactive Preview</span>
            </div>

            <h1
              className="font-display font-bold text-[#183247] tracking-tight leading-[1.12]"
              style={{
                fontSize: 'clamp(2rem, 4.2vw, 3.85rem)',
                textWrap: 'balance',
              }}
            >
              Make Someone&apos;s Birthday Magical ✨
            </h1>

            <p className="text-sm sm:text-lg text-[#183247]/80 leading-relaxed max-w-xl">
              Create a little world full of memories, smiles, and birthday wishes 💙
              Pack favorite photos, heartfelt letters, inside jokes, and 4D Pocket
              gadget surprises into an interactive step-by-step birthday adventure.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
              <button
                type="button"
                onClick={onStartBuilder}
                className="w-full sm:w-auto px-6 py-3.5 min-h-[48px] rounded-2xl bg-[#168DCE] hover:bg-[#1278B2] active:scale-[0.99] text-white font-display font-semibold text-sm sm:text-base text-center justify-center shadow-[0_10px_24px_rgba(22,141,206,0.28)] transition-all duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#64C8FF] whitespace-nowrap shrink-0 cursor-pointer"
              >
                Create Your Birthday Website 🎂
              </button>

              <button
                type="button"
                onClick={onExploreExperience}
                className="w-full sm:w-auto px-6 py-3.5 min-h-[48px] rounded-2xl bg-white hover:bg-[#EAF7FF] text-[#183247] border-2 border-[#64C8FF] font-display font-semibold text-sm sm:text-base text-center justify-center shadow-sm transition-all duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#64C8FF] whitespace-nowrap shrink-0 cursor-pointer"
              >
                Explore the Experience
              </button>
            </div>

            {/* Quiet Unboxed Metadata Highlights */}
            <div className="pt-4 border-t border-[#64C8FF]/30 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-sm text-[#183247]/75">
              <span>🚪 Interactive Anywhere Door</span>
              <span aria-hidden="true">·</span>
              <span>🎁 4D Pocket Surprises</span>
              <span aria-hidden="true">·</span>
              <span>📸 Custom Photo Storyboard</span>
              <span aria-hidden="true">·</span>
              <span>🕯️ Blow-Out Birthday Candles</span>
            </div>
          </div>

          {/* Right Column: Charming Doraemon-Inspired Illustration */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full bg-white/85 backdrop-blur-sm rounded-[24px] sm:rounded-[32px] border border-[#64C8FF]/50 p-4 sm:p-8 shadow-[0_20px_50px_rgba(22,141,206,0.12)]">
              <DoraemonHeroArtwork
                recipientName={config.recipientName || 'Birthday Star'}
                onDoorClick={onExploreExperience}
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#183247]/70 px-1 sm:px-2">
                <span className="truncate max-w-[200px] sm:max-w-none">
                  Currently previewing: {config.headline}
                </span>
                <button
                  type="button"
                  onClick={onExploreExperience}
                  className="font-semibold text-[#168DCE] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Open Door Preview →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities / Bento Grid Section */}
      <section
        id="features"
        className="bg-white border-y border-[#64C8FF]/35 py-16 sm:py-20 px-5 sm:px-8"
      >
        <div className="max-w-[1280px] mx-auto space-y-10">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold text-[#168DCE] tracking-wide">
              01. Inside the Four-Dimensional Pocket
            </p>
            <h2
              className="font-display text-2xl sm:text-4xl font-bold text-[#183247]"
              style={{ textWrap: 'balance' }}
            >
              Everything You Need to Build an Unforgettable Birthday World
            </h2>
            <p className="text-sm sm:text-base text-[#183247]/75">
              Every section is thoughtfully crafted in a crisp sky-blue and white
              palette with playful yellow bell and collar-red accents.
            </p>
          </div>

          {/* Asymmetric Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Marquee Card: Span 2 */}
            <div className="md:col-span-2 rounded-3xl bg-[#EAF7FF] border border-[#64C8FF]/50 p-7 sm:p-8 flex flex-col justify-between gap-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[#168DCE]">
                    01. Step-by-Step Microsite Journey
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#183247]">
                    From the Anywhere Door to Making a Wish 🚪🎂
                  </h3>
                  <p className="text-sm sm:text-base text-[#183247]/80 max-w-xl leading-relaxed">
                    Instead of a plain scrolling card, your recipient steps through an
                    interactive Pink Anywhere Door, flips through photo memories, pulls
                    secret gifts out of the 4D Pocket, reads your sealed letter, and
                    blows out the candles with celebratory confetti.
                  </p>
                </div>
                <DoraBellBadge size={44} className="shrink-0" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white rounded-2xl p-4 border border-[#64C8FF]/40">
                  <div className="text-sm font-bold text-[#183247]">Step 1 · Welcome</div>
                  <p className="text-xs text-[#183247]/70 mt-1">
                    Interactive Anywhere Door opens into their custom sky world.
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-[#64C8FF]/40">
                  <div className="text-sm font-bold text-[#183247]">Step 2–5 · Story</div>
                  <p className="text-xs text-[#183247]/70 mt-1">
                    Milestone counter, photo gallery, 4D gadgets, and heartfelt letter.
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-4 border border-[#64C8FF]/40">
                  <div className="text-sm font-bold text-[#183247]">Step 6 · Finale</div>
                  <p className="text-xs text-[#183247]/70 mt-1">
                    Interactive candle blow-out with golden bell chime & confetti.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Span 1 */}
            <div
              id="gadgets"
              className="rounded-3xl bg-white border border-[#64C8FF]/50 p-7 sm:p-8 flex flex-col justify-between gap-6"
            >
              <div className="space-y-3">
                <span className="text-xs font-semibold text-[#168DCE]">
                  02. Futuristic Gadgets
                </span>
                <h3 className="font-display text-xl font-bold text-[#183247]">
                  4D Pocket Surprise Drawer 🎁
                </h3>
                <p className="text-sm text-[#183247]/75 leading-relaxed">
                  Hide real-world treats—like a coffee run, movie night, or weekend
                  trip—inside iconic gadgets that unlock when clicked.
                </p>
              </div>
              <div className="flex items-center justify-around bg-[#EAF7FF] rounded-2xl p-4 border border-[#64C8FF]/35">
                <GadgetIllustration gadget="anywhere-door" className="w-11 h-11" />
                <GadgetIllustration gadget="bamboo-copter" className="w-11 h-11" />
                <GadgetIllustration gadget="memory-bread" className="w-11 h-11" />
                <GadgetIllustration gadget="time-kerchief" className="w-11 h-11" />
              </div>
            </div>

            {/* Card 3: Span 1 */}
            <div className="rounded-3xl bg-white border border-[#64C8FF]/50 p-7 sm:p-8 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#168DCE]">
                  03. Photos & Memories
                </span>
                <h3 className="font-display text-xl font-bold text-[#183247]">
                  Upload, Reorder & Caption Moments 📸
                </h3>
                <p className="text-sm text-[#183247]/75 leading-relaxed">
                  Add multiple photos from your phone or computer, write story
                  captions, reorder cards with one click, or pick from nostalgic anime
                  sky scenes.
                </p>
              </div>
              <div className="text-xs text-[#168DCE] font-medium pt-2 border-t border-[#EAF7FF]">
                Supports multi-photo upload · Instant Lightbox view
              </div>
            </div>

            {/* Card 4: Span 2 */}
            <div className="md:col-span-2 rounded-3xl bg-[#EAF7FF] border border-[#64C8FF]/50 p-7 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="text-xs font-semibold text-[#168DCE]">
                  04. Friends & Crew Wishes
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#183247]">
                  Gather Birthday Cheers from the Whole Gang 🌟
                </h3>
                <p className="text-sm text-[#183247]/80 leading-relaxed">
                  Include sweet messages from friends, family, or playful character
                  personas inspired by Nobita, Shizuka, Gian, Suneo, and Dorami.
                </p>
              </div>
              <div className="flex items-center -space-x-2 shrink-0 bg-white px-4 py-3 rounded-2xl border border-[#64C8FF]/40">
                <CharacterAvatar character="doraemon" className="w-10 h-10" />
                <CharacterAvatar character="nobita" className="w-10 h-10" />
                <CharacterAvatar character="shizuka" className="w-10 h-10" />
                <CharacterAvatar character="gian" className="w-10 h-10" />
                <CharacterAvatar character="dorami" className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Starter Templates Section */}
      <section id="templates" className="py-16 sm:py-20 px-5 sm:px-8 max-w-[1280px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#168DCE] tracking-wide">
              02. Instant Starter Worlds
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#183247]">
              Pick a Character Inspiration or Start Fresh
            </h2>
          </div>
          <button
            type="button"
            onClick={onStartBuilder}
            className="px-5 py-2.5 rounded-xl bg-[#168DCE] hover:bg-[#1278B2] text-white font-display font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
          >
            Open Customization Editor →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              key: 'nobita' as const,
              character: 'nobita' as const,
              title: 'Sunny Hilltop Classic',
              meta: 'Sky Blue · 4D Pocket Layout',
              desc: 'Warm nostalgic message, afternoon cloud memories, and 4 classic gadgets.',
            },
            {
              key: 'shizuka' as const,
              character: 'shizuka' as const,
              title: 'Anywhere Door Storybook',
              meta: 'Collar Red Accent · Storybook',
              desc: 'Gentle heartfelt stationery letter, strawberry cake wishes, and dreamy sky.',
            },
            {
              key: 'dorami' as const,
              character: 'dorami' as const,
              title: 'Golden Bell Starlight',
              meta: 'Bell Yellow Accent · Cloud Deck',
              desc: 'Bright cheerful yellow bell energy for siblings, cousins, or energetic friends.',
            },
            {
              key: 'best-friend' as const,
              character: 'doraemon' as const,
              title: 'Best Friend Adventure',
              meta: 'Doraemon Blue · Modern Capsule',
              desc: 'Tailored for your real-life best friend, partner, or sibling with funny moments.',
            },
          ].map((item) => (
            <div
              key={item.key}
              className="bg-white rounded-3xl border border-[#64C8FF]/50 p-6 flex flex-col justify-between gap-5 hover:border-[#168DCE] transition-colors shadow-[0_8px_24px_rgba(22,141,206,0.06)]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <CharacterAvatar character={item.character} className="w-12 h-12" />
                  <span className="text-xs text-[#168DCE] font-medium">{item.meta}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#183247]">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#183247]/75 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelectPresetAndBuild(item.key)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#EAF7FF] hover:bg-[#64C8FF]/30 text-[#183247] font-semibold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Use {item.title} Template
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
