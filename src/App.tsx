/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  BirthdayConfig,
  EditorTabId,
  ExperienceStepId,
} from './types/birthday';
import {
  DEFAULT_BIRTHDAY_CONFIG,
  STORAGE_DRAFT_KEY,
  STORAGE_SHARE_ID_KEY,
  applyCharacterPreset,
  decodeShareHashPayload,
  encodeShareHashPayload,
  extractShareIdFromSearch,
  normalizeBirthdayConfig,
  purgeLegacyStorage,
} from './utils/birthdayLogic';
import { FloatingSkyBackdrop } from './components/DoraemonIllustrations';
import { ConfettiOverlay } from './components/ConfettiOverlay';
import { LandingPage } from './components/LandingPage';
import { CustomizationEditor } from './components/CustomizationEditor';
import { BirthdayExperience } from './components/BirthdayExperience';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import { Loader2, AlertCircle } from 'lucide-react';

type AppViewMode = 'landing' | 'studio' | 'experience';
type MobileStudioPane = 'edit' | 'preview';

export default function App() {
  const [sharedId, setSharedId] = useState<string | null>(() =>
    typeof window !== 'undefined'
      ? extractShareIdFromSearch(window.location.search)
      : null
  );
  const skipNextRemoteFetchRef = React.useRef(false);

  // Synchronously purge legacy v1/v2 keys and any old example data before reading initial state
  if (typeof window !== 'undefined') {
    purgeLegacyStorage();
  }

  // 1. Initialize BirthdayConfig from URL hash (#d=...), share cache, localStorage draft, or clean default template
  const [config, setConfig] = useState<BirthdayConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        if (sharedId && sharedId !== 'dorav4amjv') {
          const cachedShare = window.localStorage.getItem(
            `dorapocket_share_cache_${sharedId}`
          );
          if (cachedShare) {
            const parsedShare = JSON.parse(cachedShare) as Partial<BirthdayConfig>;
            if (parsedShare && typeof parsedShare.recipientName === 'string') {
              return normalizeBirthdayConfig(parsedShare);
            }
          }
        }
        const hashPayload = decodeShareHashPayload(window.location.hash);
        if (hashPayload) {
          return normalizeBirthdayConfig(hashPayload);
        }
        const saved = window.localStorage.getItem(STORAGE_DRAFT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<BirthdayConfig>;
          if (parsed && typeof parsed.recipientName === 'string') {
            return normalizeBirthdayConfig(parsed);
          }
        }
      } catch {
        // Fallback to default config if localStorage is unavailable
      }
    }
    return DEFAULT_BIRTHDAY_CONFIG;
  });

  // 2. Initialize ViewMode (?s=<id>, #d=..., or ?mode=experience opens fullscreen experience, ?autostart=1 opens studio)
  const [viewMode, setViewMode] = useState<AppViewMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hasHashData = Boolean(decodeShareHashPayload(window.location.hash));
      if (sharedId || hasHashData || params.get('mode') === 'experience') {
        return 'experience';
      }
      if (params.get('autostart') === '1' || params.get('mode') === 'studio') {
        return 'studio';
      }
    }
    return 'landing';
  });

  const [activeEditorTab, setActiveEditorTab] = useState<EditorTabId>('details');
  const [activePreviewStep, setActivePreviewStep] =
    useState<ExperienceStepId>('welcome');
  const [mobilePane, setMobilePane] = useState<MobileStudioPane>('edit');
  const [confettiActive, setConfettiActive] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [isLoadingSharedSurprise, setIsLoadingSharedSurprise] = useState<boolean>(
    Boolean(sharedId)
  );
  const [sharedSurpriseError, setSharedSurpriseError] = useState<string | null>(
    null
  );

  // Sync URL popstate so browser Back/Forward works seamlessly with short share links
  useEffect(() => {
    const handlePopState = () => {
      const nextId = extractShareIdFromSearch(window.location.search);
      setSharedId(nextId);
      if (nextId) {
        setViewMode('experience');
        setActivePreviewStep('welcome');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch shared birthday configuration when opened via compact short link (?s=<id> or ?id=<id>)
  useEffect(() => {
    if (!sharedId) return;
    if (skipNextRemoteFetchRef.current) {
      skipNextRemoteFetchRef.current = false;
      setIsLoadingSharedSurprise(false);
      return;
    }

    let cancelled = false;
    setIsLoadingSharedSurprise(true);
    setSharedSurpriseError(null);

    const tryFetchShareJson = async (
      url: string
    ): Promise<Partial<BirthdayConfig> | null> => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return null;
        const text = await res.text();
        if (!text || text.trim().startsWith('<')) return null;
        const parsed = JSON.parse(text) as {
          id?: string;
          config?: Partial<BirthdayConfig>;
          recipientName?: string;
        };
        if (
          parsed &&
          parsed.config &&
          typeof parsed.config.recipientName === 'string'
        ) {
          return parsed.config;
        }
        if (parsed && typeof parsed.recipientName === 'string') {
          return parsed as Partial<BirthdayConfig>;
        }
      } catch {
        // Continue to next fallback source
      }
      return null;
    };

    const loadSharedSurprise = async () => {
      const safeId = encodeURIComponent(sharedId);
      let foundConfig: Partial<BirthdayConfig> | null = null;

      // 1. Check browser localStorage cache for this specific share ID first (always reflects latest user edits)
      try {
        const cached = window.localStorage.getItem(
          `dorapocket_share_cache_${sharedId}`
        );
        if (cached) {
          const parsed = JSON.parse(cached) as Partial<BirthdayConfig>;
          if (parsed && typeof parsed.recipientName === 'string') {
            foundConfig = parsed;
          }
        }
      } catch {
        // Ignore storage error
      }

      // 2. Try backend API (/api/shares?id=<id> and /api/shares/<id>)
      if (!foundConfig) {
        foundConfig = await tryFetchShareJson(`/api/shares?id=${safeId}`);
      }
      if (!foundConfig) {
        foundConfig = await tryFetchShareJson(`/api/shares/${safeId}`);
      }

      // 3. Try static JSON bundle (/shares/<id>.json) for this specific share ID
      if (!foundConfig) {
        foundConfig = await tryFetchShareJson(`/shares/${safeId}.json`);
      }

      // 4. Try client-side URL hash payload (#d=...) — works across devices & Vercel without Nginx 414
      if (!foundConfig && typeof window !== 'undefined') {
        foundConfig = decodeShareHashPayload(window.location.hash);
      }

      // 5. Fallback to current browser draft ONLY if the draft belongs to this shareId
      if (!foundConfig) {
        try {
          const currentDraftShareId = window.localStorage.getItem(
            STORAGE_SHARE_ID_KEY
          );
          const savedDraft = window.localStorage.getItem(STORAGE_DRAFT_KEY);
          if (
            savedDraft &&
            (!currentDraftShareId || currentDraftShareId === sharedId)
          ) {
            const parsed = JSON.parse(savedDraft) as Partial<BirthdayConfig>;
            if (parsed && typeof parsed.recipientName === 'string') {
              foundConfig = parsed;
            }
          }
        } catch {
          // Ignore storage error
        }
      }

      if (cancelled) return;

      if (foundConfig) {
        const normalized = normalizeBirthdayConfig(foundConfig);
        setConfig(normalized);
        setViewMode('experience');
        setActivePreviewStep('welcome');
        try {
          window.localStorage.setItem(
            `dorapocket_share_cache_${sharedId}`,
            JSON.stringify(normalized)
          );
        } catch {
          // Ignore storage quota
        }
      } else {
        setSharedSurpriseError(
          `Could not find birthday surprise link "${sharedId}".`
        );
      }
      setIsLoadingSharedSurprise(false);
    };

    loadSharedSurprise();

    return () => {
      cancelled = true;
    };
  }, [sharedId]);

  const triggerConfetti = useCallback(() => {
    setConfettiActive(true);
    const timer = setTimeout(() => {
      setConfettiActive(false);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveDraft = useCallback(
    (nextConfig: BirthdayConfig = config) => {
      try {
        window.localStorage.setItem(
          STORAGE_DRAFT_KEY,
          JSON.stringify(nextConfig)
        );
        const now = new Date();
        setLastSavedAt(
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
      } catch {
        // Ignore quota errors on very large base64 uploads
      }
    },
    [config]
  );

  // Auto-save draft locally when config changes in studio mode
  useEffect(() => {
    if (isLoadingSharedSurprise) return;
    try {
      window.localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(config));
    } catch {
      // Ignore storage quota limit
    }
  }, [config, isLoadingSharedSurprise]);

  const handleResetDefault = () => {
    setConfig(DEFAULT_BIRTHDAY_CONFIG);
    setActivePreviewStep('welcome');
    try {
      window.localStorage.removeItem(STORAGE_DRAFT_KEY);
      window.localStorage.removeItem(STORAGE_SHARE_ID_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#EAF7FF] text-[#183247] relative selection:bg-[#64C8FF]/30"
      data-view-mode={viewMode}
    >
      {/* Subtle Animated Clouds & Stars Backdrop */}
      <FloatingSkyBackdrop enabled={config.appearance.floatingAnimations} />

      {/* Celebratory Confetti Overlay */}
      <ConfettiOverlay active={confettiActive} />

      {/* Strict 3-Zone Top Bar Contract */}
      <header className="relative z-20 bg-white/90 backdrop-blur-md border-b border-[#64C8FF]/45 px-5 sm:px-8 py-3.5">
        <div className="max-w-[1380px] mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single Text Element Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setViewMode('landing');
            }}
            className="font-display text-xl font-bold tracking-tight text-[#183247] hover:text-[#168DCE] transition-colors whitespace-nowrap shrink-0"
          >
            DoraPocket 🔔
          </a>

          {/* Zone 2: 4 Single-Line Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#183247]/80"
            aria-label="Primary Navigation"
          >
            <button
              type="button"
              onClick={() => setViewMode('landing')}
              className={`hover:text-[#168DCE] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'landing'
                  ? 'text-[#168DCE] font-semibold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('studio');
                setActiveEditorTab('details');
              }}
              className={`hover:text-[#168DCE] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'studio' && activeEditorTab !== 'share'
                  ? 'text-[#168DCE] font-semibold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Customization Studio
            </button>
            <button
              type="button"
              onClick={() => setViewMode('experience')}
              className={`hover:text-[#168DCE] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'experience'
                  ? 'text-[#168DCE] font-semibold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Birthday Experience
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('studio');
                setActiveEditorTab('share');
              }}
              className={`hover:text-[#168DCE] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'studio' && activeEditorTab === 'share'
                  ? 'text-[#168DCE] font-semibold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Preview &amp; Share
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            {viewMode === 'landing' ? (
              <button
                type="button"
                onClick={() => setViewMode('studio')}
                className="px-4 py-2 rounded-xl bg-[#168DCE] hover:bg-[#1276AD] text-white font-display font-semibold text-xs sm:text-sm transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                Create Birthday Website 🎂
              </button>
            ) : viewMode === 'studio' ? (
              <button
                type="button"
                onClick={() => setViewMode('experience')}
                className="px-4 py-2 rounded-xl bg-[#168DCE] hover:bg-[#1276AD] text-white font-display font-semibold text-xs sm:text-sm transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                Explore Fullscreen ✨
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setViewMode('studio')}
                className="px-4 py-2 rounded-xl bg-[#168DCE] hover:bg-[#1276AD] text-white font-display font-semibold text-xs sm:text-sm transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                Back to Editor Studio
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1">
        {/* VIEW 1: LANDING PAGE */}
        {viewMode === 'landing' && (
          <div className="relative">
            <div className="max-w-[1380px] mx-auto px-5 sm:px-8 pt-3 flex justify-end">
              <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-[#64C8FF]/50 px-3 py-1.5 shadow-xs">
                <BackgroundMusicPlayer
                  music={config.music || DEFAULT_BIRTHDAY_CONFIG.music}
                  isPlaying={isMusicPlaying}
                  onTogglePlay={() => setIsMusicPlaying((prev) => !prev)}
                />
              </div>
            </div>
            <LandingPage
              config={config}
              onStartBuilder={() => {
                setViewMode('studio');
                setActiveEditorTab('details');
              }}
              onExploreExperience={() => {
                setViewMode('experience');
              }}
              onSelectPresetAndBuild={(preset) => {
                const updated = applyCharacterPreset(preset, config);
                setConfig(updated);
                setViewMode('studio');
                setActiveEditorTab('details');
                setActivePreviewStep('milestone');
              }}
            />
          </div>
        )}

        {/* VIEW 2: CUSTOMIZATION STUDIO + LIVE PREVIEW */}
        {viewMode === 'studio' && (
          <section className="max-w-[1380px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-5">
            {/* Studio Workspace Toolbar */}
            <div className="bg-white rounded-2xl border border-[#64C8FF]/50 px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#168DCE] font-semibold">
                  <span className="whitespace-nowrap">4D Pocket Studio</span>
                  <span aria-hidden="true">·</span>
                  <span className="whitespace-nowrap">
                    Editing: {config.recipientName || 'Untitled'}&apos;s Birthday
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="whitespace-nowrap">Auto-saved locally</span>
                </div>
                <h1 className="font-display text-lg sm:text-xl font-bold text-[#183247]">
                  Customize &amp; Preview Live 💙
                </h1>
              </div>

              {/* Mobile Edit / Live Preview Switch (Visible on < lg screens) */}
              <div className="flex lg:hidden items-center gap-1 p-1 bg-[#EAF7FF] rounded-xl border border-[#64C8FF]/40">
                <button
                  type="button"
                  onClick={() => setMobilePane('edit')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    mobilePane === 'edit'
                      ? 'bg-[#168DCE] text-white shadow-xs'
                      : 'text-[#183247]/75'
                  }`}
                >
                  ✏️ Edit Website
                </button>
                <button
                  type="button"
                  onClick={() => setMobilePane('preview')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    mobilePane === 'preview'
                      ? 'bg-[#168DCE] text-white shadow-xs'
                      : 'text-[#183247]/75'
                  }`}
                >
                  🎂 Live Preview
                </button>
              </div>

              {/* Desktop Quick Actions */}
              <div className="hidden sm:flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSaveDraft(config)}
                  className="px-3.5 py-2 rounded-xl bg-[#EAF7FF] hover:bg-[#64C8FF]/30 text-[#183247] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Save Local Draft 💾
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEditorTab('share')}
                  className="px-3.5 py-2 rounded-xl bg-[#FFD84D] hover:bg-[#F5CA2E] text-[#183247] text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Share Surprise 🎁
                </button>
              </div>
            </div>

            {/* Split-Screen Grid on Desktop / Toggle Pane on Mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Customization Editor (5 cols on lg) */}
              <div
                className={`lg:col-span-5 ${
                  mobilePane === 'preview' ? 'hidden lg:block' : 'block'
                }`}
              >
                <CustomizationEditor
                  config={config}
                  onChange={setConfig}
                  activeTab={activeEditorTab}
                  onTabChange={setActiveEditorTab}
                  onJumpToPreviewStep={setActivePreviewStep}
                  onSaveDraft={() => handleSaveDraft(config)}
                  onResetDefault={handleResetDefault}
                  onOpenFullscreenExperience={() => setViewMode('experience')}
                  onOpenShareLink={(targetId) => {
                    skipNextRemoteFetchRef.current = true;
                    try {
                      window.localStorage.setItem(
                        `dorapocket_share_cache_${targetId}`,
                        JSON.stringify(config)
                      );
                      const hashData = encodeShareHashPayload(config);
                      const nextUrl = hashData
                        ? `/?s=${encodeURIComponent(targetId)}#d=${hashData}`
                        : `/?s=${encodeURIComponent(targetId)}`;
                      window.history.pushState({}, '', nextUrl);
                    } catch {
                      // Ignore history/storage restriction
                    }
                    setSharedId(targetId);
                    setIsLoadingSharedSurprise(false);
                    setSharedSurpriseError(null);
                    setViewMode('experience');
                    setActivePreviewStep('welcome');
                  }}
                  lastSavedAt={lastSavedAt}
                  isMusicPlaying={isMusicPlaying}
                  onToggleMusic={() => setIsMusicPlaying((prev) => !prev)}
                />
              </div>

              {/* Right Column: Live Interactive Birthday Website Preview (7 cols on lg) */}
              <div
                className={`lg:col-span-7 ${
                  mobilePane === 'edit' ? 'hidden lg:block' : 'block'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-2 text-xs text-[#183247]/70">
                    <span className="font-semibold text-[#168DCE]">
                      ✨ Live Interactive Microsite Preview (Updates Instantly)
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewMode('experience')}
                      className="font-semibold text-[#168DCE] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Expand Fullscreen ↗
                    </button>
                  </div>

                  <BirthdayExperience
                    config={config}
                    activeStepId={activePreviewStep}
                    onStepChange={setActivePreviewStep}
                    onTriggerConfetti={triggerConfetti}
                    isFullscreen={false}
                    onToggleFullscreen={() => setViewMode('experience')}
                    isMusicPlaying={isMusicPlaying}
                    onToggleMusic={() => setIsMusicPlaying((prev) => !prev)}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* VIEW 3: FULLSCREEN INTERACTIVE BIRTHDAY EXPERIENCE */}
        {viewMode === 'experience' && (
          <section className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/85 backdrop-blur-xs px-5 py-3 rounded-2xl border border-[#64C8FF]/50">
              <div className="text-xs font-semibold text-[#168DCE]">
                🎂 Viewing {config.recipientName || 'Birthday'}&apos;s Interactive
                Birthday Experience
                {sharedId ? ` (Shared Surprise #${sharedId})` : ''}
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={triggerConfetti}
                  className="px-3.5 py-1.5 rounded-xl bg-[#FFD84D] hover:bg-[#F5CA2E] text-[#183247] text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Pop Confetti 🎉
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('studio')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#EAF7FF] hover:bg-[#64C8FF]/30 text-[#183247] text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Customize This Website ✏️
                </button>
              </div>
            </div>

            {sharedSurpriseError && (
              <div
                role="alert"
                className="bg-white border-2 border-[#F04444]/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#F04444] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h2 className="font-display font-bold text-sm text-[#183247]">
                      Could Not Load Shared Birthday Link
                    </h2>
                    <p className="text-xs text-[#183247]/75">
                      {sharedSurpriseError}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSharedSurpriseError(null);
                    setViewMode('studio');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#168DCE] hover:bg-[#1276AD] text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Create a New Birthday Surprise 🎂
                </button>
              </div>
            )}

            {isLoadingSharedSurprise ? (
              <div
                role="status"
                className="bg-white rounded-[32px] border-2 border-[#64C8FF]/70 p-12 text-center space-y-4 shadow-md"
              >
                <Loader2 className="w-8 h-8 text-[#168DCE] animate-spin mx-auto" />
                <h2 className="font-display text-xl font-bold text-[#183247]">
                  Opening Doraemon&apos;s 4D Pocket Surprise... 🔔✨
                </h2>
                <p className="text-xs text-[#183247]/70">
                  Loading personalized wishes, memories, and birthday surprises...
                </p>
              </div>
            ) : (
              <BirthdayExperience
                config={config}
                activeStepId={activePreviewStep}
                onStepChange={setActivePreviewStep}
                onTriggerConfetti={triggerConfetti}
                isFullscreen={true}
                onToggleFullscreen={() => setViewMode('studio')}
                isMusicPlaying={isMusicPlaying}
                onToggleMusic={() => setIsMusicPlaying((prev) => !prev)}
              />
            )}
          </section>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="relative z-10 bg-white/80 border-t border-[#64C8FF]/35 py-6 px-5 sm:px-8 mt-12">
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#183247]/70">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-[#183247]">
              DoraPocket Birthday Studio 🔔
            </span>
            <span aria-hidden="true">·</span>
            <span>Crafted for Magical Birthday Memories 💙</span>
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setViewMode('landing')}
              className="hover:text-[#168DCE] cursor-pointer"
            >
              Landing Page
            </button>
            <button
              type="button"
              onClick={() => setViewMode('studio')}
              className="hover:text-[#168DCE] cursor-pointer"
            >
              Customization Editor
            </button>
            <button
              type="button"
              onClick={() => setViewMode('experience')}
              className="hover:text-[#168DCE] cursor-pointer"
            >
              Explore Experience
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
