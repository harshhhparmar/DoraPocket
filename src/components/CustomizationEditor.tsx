import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AccentTheme,
  BirthdayConfig,
  CharacterKey,
  EditorTabId,
  ExperienceStepId,
  GadgetKey,
  LayoutStyle,
  MusicTrackSource,
  PhotoMemory,
} from '../types/birthday';
import {
  DEFAULT_BIRTHDAY_CONFIG,
  DEFAULT_MEMORIES,
  STORAGE_SHARE_ID_KEY,
  applyCharacterPreset,
  buildCompactShareUrl,
  createMemorySceneDataUri,
  extractYouTubeVideoId,
  generateStandaloneBirthdayHtml,
  moveItemInArray,
  normalizeBirthdayConfig,
  validateBirthdayDetails,
} from '../utils/birthdayLogic';
import {
  CharacterAvatar,
  GadgetIllustration,
} from './DoraemonIllustrations';
import {
  User,
  Image as ImageIcon,
  Sparkles,
  Palette,
  Share2,
  Upload,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Check,
  Copy,
  Download,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  ExternalLink,
  Music,
  Play,
  Pause,
  Volume2,
  Loader2,
  FileCode,
  AlertCircle,
  RefreshCw,
  Crop,
} from 'lucide-react';
import { PhotoCropEditorModal } from './PhotoCropEditorModal';

interface CustomizationEditorProps {
  config: BirthdayConfig;
  onChange: (nextConfig: BirthdayConfig) => void;
  activeTab: EditorTabId;
  onTabChange: (tab: EditorTabId) => void;
  onJumpToPreviewStep: (step: ExperienceStepId) => void;
  onSaveDraft: () => void;
  onResetDefault: () => void;
  onOpenFullscreenExperience: () => void;
  onOpenShareLink?: (shortId: string) => void;
  lastSavedAt: string | null;
  isMusicPlaying?: boolean;
  onToggleMusic?: () => void;
}

export const CustomizationEditor: React.FC<CustomizationEditorProps> = ({
  config,
  onChange,
  activeTab,
  onTabChange,
  onJumpToPreviewStep,
  onSaveDraft,
  onResetDefault,
  onOpenFullscreenExperience,
  onOpenShareLink,
  lastSavedAt,
  isMusicPlaying = false,
  onToggleMusic,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonImportRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customImageCaption, setCustomImageCaption] = useState('');

  // Short-ID Share Link & Upload state
  const [shareId, setShareId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        return window.localStorage.getItem(STORAGE_SHARE_ID_KEY) || 'dorav4amjv';
      } catch {
        return 'dorav4amjv';
      }
    }
    return 'dorav4amjv';
  });
  const [isPublishingShare, setIsPublishingShare] = useState(false);
  const [shareSuccessMsg, setShareSuccessMsg] = useState<string | null>(null);
  const [shareErrorMsg, setShareErrorMsg] = useState<string | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [editingCropMemory, setEditingCropMemory] = useState<PhotoMemory | null>(
    null
  );

  // New Wish state
  const [newWishSender, setNewWishSender] = useState('');
  const [newWishRole, setNewWishRole] = useState('');
  const [newWishCharacter, setNewWishCharacter] = useState<CharacterKey>('shizuka');
  const [newWishMessage, setNewWishMessage] = useState('');

  // New Funny Moment state
  const [newMomentTitle, setNewMomentTitle] = useState('');
  const [newMomentTag, setNewMomentTag] = useState('');
  const [newMomentEmoji, setNewMomentEmoji] = useState('🎉');
  const [newMomentDesc, setNewMomentDesc] = useState('');

  const validation = validateBirthdayDetails(config);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage((prev) => (prev === msg ? null : prev));
    }, 3400);
  };

  const updateField = <K extends keyof BirthdayConfig>(
    key: K,
    value: BirthdayConfig[K]
  ) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  const currentMusic = config.music || DEFAULT_BIRTHDAY_CONFIG.music;

  /**
   * Uploads a base64 dataUrl to POST /api/uploads and returns the compact server URL (/api/uploads/...).
   */
  const uploadDataUrlToServer = async (
    dataUrl: string,
    prefix: string
  ): Promise<string> => {
    try {
      const response = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl, prefix }),
      });
      if (response.ok) {
        const data = (await response.json()) as { url?: string };
        if (data && typeof data.url === 'string') {
          return data.url;
        }
      }
    } catch {
      // Fallback to dataUrl if offline
    }
    return dataUrl;
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMedia(true);
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const cleanTitle =
          file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') ||
          'Custom Birthday Track';
        const storedAudioUrl = await uploadDataUrlToServer(
          reader.result,
          'audio'
        );
        updateField('music', {
          ...currentMusic,
          source: 'custom-upload',
          trackTitle: cleanTitle,
          customAudioDataUrl: storedAudioUrl,
        });
        showToast(`Uploaded audio track "${cleanTitle}" 🎵`);
      }
      setIsUploadingMedia(false);
    };
    reader.onerror = () => setIsUploadingMedia(false);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const renderMusicSettingsSection = () => {
    const tracks: {
      id: MusicTrackSource;
      title: string;
      subtitle: string;
      badge: string;
    }[] = [
      {
        id: 'youtube',
        title: 'Doraemon Cartoon Theme (Original)',
        subtitle: 'YouTube · Yume wo Kanaete / Classic Doraemon BGM',
        badge: 'YouTube 🎬',
      },
      {
        id: 'synth-dora-march',
        title: '22nd-Century Pocket March',
        subtitle: 'Upbeat anime-inspired chime melody (Built-in)',
        badge: 'Chime Synth 🔔',
      },
      {
        id: 'synth-music-box',
        title: 'Anywhere Door Music Box',
        subtitle: 'Gentle nostalgic music box lullaby (Built-in)',
        badge: 'Music Box ✨',
      },
      {
        id: 'synth-birthday-bell',
        title: 'Golden Bell Birthday Song',
        subtitle: 'Celebratory Happy Birthday bell arrangement',
        badge: 'Birthday 🎂',
      },
    ];

    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-[#EAF7FF]/75 border border-[#64C8FF]/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-sm sm:text-base font-bold text-[#183247] flex items-center gap-1.5">
              <Music className="w-4 h-4 text-[#168DCE]" />
              <span>Background Music Track 🎵</span>
            </h3>
            <p className="text-xs text-[#183247]/70">
              Select the Doraemon cartoon theme, paste a YouTube link, or upload
              your own audio file (.mp3, .wav, .ogg).
            </p>
          </div>

          {onToggleMusic && (
            <button
              type="button"
              onClick={onToggleMusic}
              className={`px-3.5 py-2 rounded-xl text-xs font-display font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                isMusicPlaying
                  ? 'bg-[#FFD84D] text-[#183247] border border-[#183247]/20 shadow-xs'
                  : 'bg-[#168DCE] hover:bg-[#1276AD] text-white shadow-xs'
              }`}
            >
              {isMusicPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Preview Music</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Test Play Music 🎵</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Curated Track Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {tracks.map((track) => {
            const active = currentMusic.source === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => {
                  const nextYoutubeUrl =
                    track.id === 'youtube'
                      ? currentMusic.youtubeUrl ||
                        'https://www.youtube.com/watch?v=iwncGYFPxmU'
                      : currentMusic.youtubeUrl;
                  const nextVideoId =
                    track.id === 'youtube'
                      ? extractYouTubeVideoId(nextYoutubeUrl) || 'iwncGYFPxmU'
                      : currentMusic.youtubeVideoId;
                  updateField('music', {
                    ...currentMusic,
                    source: track.id,
                    trackTitle: track.title,
                    youtubeUrl: nextYoutubeUrl,
                    youtubeVideoId: nextVideoId,
                  });
                  showToast(`Selected "${track.title}" 🎵`);
                }}
                className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  active
                    ? 'bg-white border-[#168DCE] shadow-xs'
                    : 'bg-white/70 border-[#64C8FF]/40 hover:border-[#64C8FF]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 w-full">
                  <span className="font-display font-bold text-xs text-[#183247]">
                    {track.title}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                      active
                        ? 'bg-[#FFD84D] text-[#183247]'
                        : 'bg-[#EAF7FF] text-[#168DCE]'
                    }`}
                  >
                    {track.badge}
                  </span>
                </div>
                <span className="text-[11px] text-[#183247]/65">
                  {track.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* YouTube Link Customization when YouTube track is active (or to switch to YouTube) */}
        <div className="p-3.5 rounded-xl bg-white border border-[#64C8FF]/50 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-bold text-[#183247]">
              Doraemon YouTube Music URL
            </label>
            <button
              type="button"
              onClick={() => {
                updateField('music', {
                  ...currentMusic,
                  source: 'youtube',
                  trackTitle: 'Doraemon Cartoon Theme (Original)',
                  youtubeUrl: 'https://www.youtube.com/watch?v=iwncGYFPxmU',
                  youtubeVideoId: 'iwncGYFPxmU',
                });
                showToast('Restored official Doraemon Cartoon Theme 🎵');
              }}
              className="text-[11px] font-semibold text-[#168DCE] hover:underline cursor-pointer"
            >
              Reset Default Doraemon Link
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={currentMusic.youtubeUrl}
              aria-label="Doraemon YouTube Music URL"
              onChange={(e) => {
                const rawUrl = e.target.value;
                const extracted = extractYouTubeVideoId(rawUrl);
                updateField('music', {
                  ...currentMusic,
                  source: 'youtube',
                  trackTitle:
                    rawUrl.includes('iwncGYFPxmU') || !rawUrl.trim()
                      ? 'Doraemon Cartoon Theme (Original)'
                      : 'Custom YouTube Doraemon Track',
                  youtubeUrl: rawUrl,
                  youtubeVideoId: extracted || currentMusic.youtubeVideoId || 'iwncGYFPxmU',
                });
              }}
              placeholder="https://www.youtube.com/watch?v=iwncGYFPxmU"
              className="flex-1 px-3 py-2 rounded-xl bg-[#EAF7FF]/50 border border-[#64C8FF]/60 text-xs text-[#183247] focus:outline-none focus:border-[#168DCE]"
            />
          </div>
          <p className="text-[11px] text-[#183247]/65">
            Default track: Doraemon Cartoon Music (
            <code className="text-[#168DCE] font-semibold">
              youtube.com/watch?v=iwncGYFPxmU
            </code>
            ) · Active Video ID:{' '}
            <span className="font-semibold text-[#183247]">
              {currentMusic.youtubeVideoId || 'iwncGYFPxmU'}
            </span>
          </p>
        </div>

        {/* Upload Custom Audio File (.mp3 / .wav / .ogg) & Volume Control */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
          <div>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className={`w-full px-3.5 py-2.5 rounded-xl border-2 border-dashed text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                currentMusic.source === 'custom-upload'
                  ? 'bg-white border-[#168DCE] text-[#168DCE]'
                  : 'bg-white/80 hover:bg-white border-[#64C8FF] text-[#183247]'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-[#168DCE] shrink-0" />
              <span className="truncate">
                {currentMusic.source === 'custom-upload'
                  ? `Audio: ${currentMusic.trackTitle}`
                  : 'Upload Audio (.MP3 / .WAV)'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 bg-white px-3.5 py-2 rounded-xl border border-[#64C8FF]/50">
            <Volume2 className="w-4 h-4 text-[#168DCE] shrink-0" />
            <label
              htmlFor="music-volume-slider"
              className="text-xs font-semibold text-[#183247] whitespace-nowrap"
            >
              Volume: {currentMusic.volume}%
            </label>
            <input
              id="music-volume-slider"
              type="range"
              min={10}
              max={100}
              step={5}
              value={currentMusic.volume}
              onChange={(e) =>
                updateField('music', {
                  ...currentMusic,
                  volume: Number(e.target.value),
                })
              }
              className="w-full accent-[#168DCE] cursor-pointer"
            />
          </div>
        </div>
      </div>
    );
  };

  // Handle Multi-Photo File Upload (Stores uploaded photos on server and saves their compact URLs)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files);
    e.target.value = '';
    setIsUploadingMedia(true);

    try {
      const uploadedMemories = await Promise.all(
        selectedFiles.map(
          (file, index) =>
            new Promise<PhotoMemory | null>((resolve) => {
              const reader = new FileReader();
              reader.onload = async () => {
                if (typeof reader.result === 'string') {
                  const storedImageUrl = await uploadDataUrlToServer(
                    reader.result,
                    'photo'
                  );
                  resolve({
                    id: `upload-${Date.now()}-${index}`,
                    imageUrl: storedImageUrl,
                    caption:
                      file.name
                        .replace(/\.[^/.]+$/, '')
                        .replace(/[-_]/g, ' ') || 'Birthday Snapshot',
                    dateLabel: 'Uploaded Memory · Special Day',
                    story:
                      'A favorite snapshot added to our birthday time capsule.',
                  });
                } else {
                  resolve(null);
                }
              };
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(file);
            })
        )
      );

      const validNewMemories = uploadedMemories.filter(
        (m): m is PhotoMemory => m !== null
      );

      if (validNewMemories.length > 0) {
        onChange({
          ...config,
          memories: [...config.memories, ...validNewMemories],
        });
        onJumpToPreviewStep('memories');
        showToast(
          validNewMemories.length === 1
            ? `Uploaded "${validNewMemories[0].caption}" to Photo Gallery 📸`
            : `Uploaded ${validNewMemories.length} photos to Photo Gallery 📸`
        );
      }
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleAddSceneMemory = (
    scene: 'sunset-hill' | 'birthday-cake' | 'starry-door' | 'summer-beach',
    defaultTitle: string
  ) => {
    const newMem: PhotoMemory = {
      id: `scene-${Date.now()}`,
      imageUrl: createMemorySceneDataUri(scene),
      caption: defaultTitle,
      dateLabel: '22nd-Century Sky Album',
      story: 'Every adventure under this bright blue sky brings back the best smiles.',
      scenePreset: scene,
    };
    onChange({
      ...config,
      memories: [...config.memories, newMem],
    });
    onJumpToPreviewStep('memories');
    showToast(`Added "${defaultTitle}" illustration ✨`);
  };

  const handleAddCustomUrlMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customImageUrl.trim()) return;
    const newMem: PhotoMemory = {
      id: `url-${Date.now()}`,
      imageUrl: customImageUrl.trim(),
      caption: customImageCaption.trim() || 'Special Birthday Memory',
      dateLabel: 'Custom Snapshot',
      story: 'Captured for our birthday story.',
      scenePreset: 'sunset-hill',
    };
    onChange({
      ...config,
      memories: [...config.memories, newMem],
    });
    setCustomImageUrl('');
    setCustomImageCaption('');
    onJumpToPreviewStep('memories');
    showToast('Added custom photo to gallery 📸');
  };

  const handleMoveMemory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = moveItemInArray(config.memories, index, targetIndex);
    updateField('memories', reordered);
    onJumpToPreviewStep('memories');
  };

  const handleDeleteMemory = (id: string) => {
    updateField(
      'memories',
      config.memories.filter((m) => m.id !== id)
    );
    onJumpToPreviewStep('memories');
  };

  const handleUpdateMemory = (
    id: string,
    patch: Partial<PhotoMemory>
  ) => {
    updateField(
      'memories',
      config.memories.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
    onJumpToPreviewStep('memories');
  };

  const handleSaveCroppedPhoto = async (
    memoryId: string,
    croppedDataUrl: string,
    updatedCaption: string
  ) => {
    setIsUploadingMedia(true);
    try {
      const storedUrl = await uploadDataUrlToServer(
        croppedDataUrl,
        'cropped-photo'
      );
      updateField(
        'memories',
        config.memories.map((m) =>
          m.id === memoryId
            ? {
                ...m,
                imageUrl: storedUrl,
                caption: updatedCaption || m.caption,
              }
            : m
        )
      );
      onJumpToPreviewStep('memories');
      showToast('Applied crop & visual enhancements to photo! ✨📸');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishSender.trim() || !newWishMessage.trim()) return;
    const nextWishes = [
      ...config.wishes,
      {
        id: `wish-${Date.now()}`,
        senderName: newWishSender.trim(),
        roleLabel: newWishRole.trim() || 'Birthday Friend',
        character: newWishCharacter,
        message: newWishMessage.trim(),
      },
    ];
    updateField('wishes', nextWishes);
    setNewWishSender('');
    setNewWishRole('');
    setNewWishMessage('');
    onJumpToPreviewStep('letter');
    showToast('Added birthday wish to the crew wall 🌟');
  };

  const handleAddFunnyMoment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMomentTitle.trim() || !newMomentDesc.trim()) return;
    const nextMoments = [
      ...config.funnyMoments,
      {
        id: `moment-${Date.now()}`,
        title: newMomentTitle.trim(),
        episodeTag: newMomentTag.trim() || `Episode 0${config.funnyMoments.length + 1}`,
        emoji: newMomentEmoji || '😄',
        description: newMomentDesc.trim(),
      },
    ];
    updateField('funnyMoments', nextMoments);
    setNewMomentTitle('');
    setNewMomentTag('');
    setNewMomentDesc('');
    onJumpToPreviewStep('surprises');
    showToast('Added funny moment card 😄');
  };

  /**
   * Publishes or updates the birthday configuration on the backend (/api/shares),
   * storing uploaded photos as URLs and returning a compact short-ID share link (?s=<shortId>).
   */
  const publishShareConfiguration = useCallback(
    async (copyToClipboard: boolean): Promise<string | null> => {
      setIsPublishingShare(true);
      setShareErrorMsg(null);
      if (copyToClipboard) {
        setShareSuccessMsg(null);
      }

      try {
        let resolvedId = shareId || 'dorav4amjv';
        let resolvedConfig: BirthdayConfig = config;

        try {
          const response = await fetch('/api/shares', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: resolvedId,
              config,
            }),
          });

          if (response.ok) {
            const text = await response.text();
            if (text && !text.trim().startsWith('<')) {
              const data = JSON.parse(text) as {
                id?: string;
                sharePath?: string;
                config?: BirthdayConfig;
              };
              if (data.id) {
                resolvedId = data.id;
              }
              if (data.config) {
                resolvedConfig = normalizeBirthdayConfig(data.config);
                onChange(resolvedConfig);
              }
            }
          }
        } catch {
          // On static read-only hosts where POST /api/shares is unavailable, keep resolvedId and cache locally
        }

        setShareId(resolvedId);
        try {
          window.localStorage.setItem(STORAGE_SHARE_ID_KEY, resolvedId);
          window.localStorage.setItem(
            `dorapocket_share_cache_${resolvedId}`,
            JSON.stringify(resolvedConfig)
          );
        } catch {
          // Ignore storage error
        }

        const compactUrl = buildCompactShareUrl(
          window.location.origin,
          window.location.pathname,
          resolvedId
        );

        if (copyToClipboard) {
          try {
            await navigator.clipboard.writeText(compactUrl);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 3200);
            setShareSuccessMsg(
              `Compact share link (${compactUrl}) saved & copied to clipboard! 🎉`
            );
            showToast('Compact share link saved & copied to clipboard! 🔗');
          } catch {
            setShareSuccessMsg(
              `Compact share link ready (${compactUrl}) — copy it above to share! 🎉`
            );
            showToast('Compact share link generated! 🔗');
          }
        } else {
          setShareSuccessMsg(
            `Synced live share link (?s=${resolvedId}) with all photos & wishes ✨`
          );
        }

        return compactUrl;
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Unable to publish share link right now. You can also download the Self-Contained HTML Surprise below.';
        setShareErrorMsg(msg);
        return null;
      } finally {
        setIsPublishingShare(false);
      }
    },
    [config, onChange, shareId]
  );

  // Automatically publish/sync the short share link when the user opens the Share tab
  useEffect(() => {
    if (activeTab === 'share') {
      publishShareConfiguration(false);
    }
  }, [activeTab]);

  const handleCopyShareLink = async () => {
    await publishShareConfiguration(true);
  };

  const handleExportStandaloneHtml = () => {
    const htmlContent = generateStandaloneBirthdayHtml(config);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = (config.recipientName || 'birthday')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    a.href = url;
    a.download = `dorapocket-${slug}-birthday-surprise.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Downloaded self-contained HTML birthday website! 🎂');
  };

  const handleExportJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(config, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    const slug = (config.recipientName || 'birthday')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    a.setAttribute('download', `dorapocket-${slug}-birthday.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Downloaded birthday configuration JSON file 💾');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as BirthdayConfig;
        if (parsed && typeof parsed.recipientName === 'string') {
          onChange(normalizeBirthdayConfig(parsed));
          showToast(`Imported birthday configuration for ${parsed.recipientName}! 🎉`);
        }
      } catch {
        showToast('Could not read JSON file. Please pick a valid DoraPocket backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const tabs: Array<{
    id: EditorTabId;
    label: string;
    icon: React.ReactNode;
    stepTarget?: ExperienceStepId;
  }> = [
    {
      id: 'details',
      label: 'Details',
      icon: <User className="w-3.5 h-3.5" />,
      stepTarget: 'milestone',
    },
    {
      id: 'memories',
      label: 'Photos',
      icon: <ImageIcon className="w-3.5 h-3.5" />,
      stepTarget: 'memories',
    },
    {
      id: 'experience',
      label: 'Experience',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      stepTarget: 'surprises',
    },
    {
      id: 'appearance',
      label: 'Theme',
      icon: <Palette className="w-3.5 h-3.5" />,
    },
    {
      id: 'share',
      label: 'Share',
      icon: <Share2 className="w-3.5 h-3.5" />,
    },
  ];

  const shareUrlPreview =
    typeof window !== 'undefined' && shareId
      ? buildCompactShareUrl(
          window.location.origin,
          window.location.pathname,
          shareId
        )
      : typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}?s=...`
        : '';

  return (
    <div className="bg-white rounded-[28px] border-2 border-[#64C8FF]/60 shadow-[0_14px_40px_rgba(22,141,206,0.09)] overflow-hidden flex flex-col">
      {/* Editor Top Navigation Tabs */}
      <div className="bg-[#EAF7FF]/80 border-b border-[#64C8FF]/40 px-3.5 py-2.5">
        <div
          className="grid grid-cols-5 gap-1.5"
          role="tablist"
          aria-label="Customization Editor Sections"
        >
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  onTabChange(tab.id);
                  if (tab.stepTarget) {
                    onJumpToPreviewStep(tab.stepTarget);
                  }
                }}
                className={`px-2 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#168DCE] text-white shadow-xs'
                    : 'bg-white/80 text-[#183247]/75 hover:bg-white hover:text-[#183247]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inline Status Toast Banner */}
      {statusMessage && (
        <div
          role="status"
          className="bg-[#EAF7FF] border-b border-[#64C8FF] px-5 py-2.5 text-xs font-semibold text-[#168DCE] flex items-center justify-between"
        >
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-[#183247]/60 hover:text-[#183247] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Editor Body */}
      <div className="p-5 sm:p-6 space-y-6 max-h-[720px] overflow-y-auto">
        {/* TAB A: BIRTHDAY DETAILS */}
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAF7FF]">
              <div>
                <h2 className="font-display text-xl font-bold text-[#183247]">
                  Birthday Person&apos;s Details 🎂
                </h2>
                <p className="text-xs text-[#183247]/70">
                  Every field updates the live birthday website beside you in real time.
                </p>
              </div>

              {/* Quick Character Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: 'nobita', label: 'Nobita' },
                    { id: 'shizuka', label: 'Shizuka' },
                    { id: 'dorami', label: 'Dorami' },
                    { id: 'best-friend', label: 'Best Friend' },
                  ] as const
                ).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onChange(applyCharacterPreset(preset.id, config));
                      showToast(`Loaded ${preset.label} preset ✨`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#EAF7FF] hover:bg-[#64C8FF]/40 text-[#183247] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Recipient Name */}
              <div>
                <label
                  htmlFor="input-recipient-name"
                  className="block text-xs font-bold text-[#183247] mb-1.5"
                >
                  Birthday Person&apos;s Name *
                </label>
                <input
                  id="input-recipient-name"
                  type="text"
                  value={config.recipientName}
                  onChange={(e) => {
                    const nextName = e.target.value;
                    onChange({
                      ...config,
                      recipientName: nextName,
                      headline: `Happy Birthday, ${nextName || 'Friend'}! 🎂`,
                    });
                  }}
                  placeholder="e.g., Nobita, Shizuka, Alex"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF7FF]/50 border border-[#64C8FF] text-sm text-[#183247] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#168DCE]"
                />
                {validation.errors.recipientName && (
                  <p className="text-xs text-[#F04444] mt-1 font-medium">
                    {validation.errors.recipientName}
                  </p>
                )}
              </div>

              {/* Nickname */}
              <div>
                <label
                  htmlFor="input-nickname"
                  className="block text-xs font-bold text-[#183247] mb-1.5"
                >
                  Nickname / Inside Title
                </label>
                <input
                  id="input-nickname"
                  type="text"
                  value={config.nickname}
                  onChange={(e) => updateField('nickname', e.target.value)}
                  placeholder="e.g., Nobi-kun, Captain"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF7FF]/50 border border-[#64C8FF] text-sm text-[#183247] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#168DCE]"
                />
              </div>

              {/* Age / Milestone */}
              <div>
                <label
                  htmlFor="input-age"
                  className="block text-xs font-bold text-[#183247] mb-1.5"
                >
                  Turning Age (Milestone) *
                </label>
                <input
                  id="input-age"
                  type="number"
                  min={1}
                  max={150}
                  value={config.age}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10);
                    updateField('age', Number.isNaN(parsed) ? 1 : parsed);
                    onJumpToPreviewStep('milestone');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF7FF]/50 border border-[#64C8FF] text-sm text-[#183247] font-mono-num focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#168DCE]"
                />
                {validation.errors.age && (
                  <p className="text-xs text-[#F04444] mt-1 font-medium">
                    {validation.errors.age}
                  </p>
                )}
              </div>

              {/* Birthday Date */}
              <div>
                <label
                  htmlFor="input-birthday-date"
                  className="block text-xs font-bold text-[#183247] mb-1.5"
                >
                  Birthday Date
                </label>
                <input
                  id="input-birthday-date"
                  type="date"
                  value={config.birthdayDate}
                  onChange={(e) => {
                    updateField('birthdayDate', e.target.value);
                    onJumpToPreviewStep('milestone');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF7FF]/50 border border-[#64C8FF] text-sm text-[#183247] font-mono-num focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#168DCE]"
                />
              </div>

              {/* Sender's Name */}
              <div>
                <label
                  htmlFor="input-sender-name"
                  className="block text-xs font-bold text-[#183247] mb-1.5"
                >
                  From (Sender&apos;s Name) *
                </label>
                <input
                  id="input-sender-name"
                  type="text"
                  value={config.senderName}
                  onChange={(e) => updateField('senderName', e.target.value)}
                  placeholder="e.g., Doraemon & Crew"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF7FF]/50 border border-[#64C8FF] text-sm text-[#183247] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#168DCE]"
                />
              </div>

              {/* Relationship */}
              <div>
                <label
                  htmlFor="input-relationship"
                  className="block text-xs font-bold text-[#183247] mb-1.5"
                >
                  Relationship
                </label>
                <input
                  id="input-relationship"
                  type="text"
                  value={config.relationship}
                  onChange={(e) => updateField('relationship', e.target.value)}
                  placeholder="e.g., Best Friend, Partner, Sister"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF7FF]/50 border border-[#64C8FF] text-sm text-[#183247] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#168DCE]"
                />
              </div>
            </div>

            {/* Celebration Headline */}
            <div>
              <label
                htmlFor="input-headline"
                className="block text-xs font-bold text-[#183247] mb-1.5"
              >
                Main Celebration Headline *
              </label>
              <input
                id="input-headline"
                type="text"
                value={config.headline}
                onChange={(e) => {
                  updateField('headline', e.target.value);
                  onJumpToPreviewStep('milestone');
                }}
                placeholder="Happy Birthday, Nobita! 🎂"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF7FF]/50 border border-[#64C8FF] text-sm text-[#183247] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#168DCE]"
              />
            </div>

            {/* Personal Birthday Message */}
            <div>
              <label
                htmlFor="input-personal-message"
                className="block text-xs font-bold text-[#183247] mb-1.5"
              >
                Personalized Opening Message 💙
              </label>
              <textarea
                id="input-personal-message"
                rows={4}
                value={config.personalMessage}
                onChange={(e) => {
                  updateField('personalMessage', e.target.value);
                  onJumpToPreviewStep('milestone');
                }}
                placeholder="Write a heartfelt birthday welcome note..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF7FF]/50 border border-[#64C8FF] text-sm text-[#183247] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#168DCE] leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TAB B: PHOTOS & MEMORIES */}
        {activeTab === 'memories' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAF7FF]">
              <div>
                <h2 className="font-display text-xl font-bold text-[#183247]">
                  Photos &amp; Memories Album 📸
                </h2>
                <p className="text-xs text-[#183247]/70">
                  Upload photos from your device, add anime sky scenes, edit captions,
                  and reorder cards.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingMedia}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-[#168DCE] hover:bg-[#1276AD] disabled:opacity-60 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isUploadingMedia ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading Photos...
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      Upload Photos
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Anime Scene Preset Bar */}
            <div className="bg-[#EAF7FF]/70 rounded-2xl p-4 border border-[#64C8FF]/40 space-y-2.5">
              <span className="text-xs font-bold text-[#183247] block">
                Add a Doraemon-Inspired Sky Scene Illustration:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { scene: 'sunset-hill' as const, label: '+ Sunset Hilltop' },
                  { scene: 'birthday-cake' as const, label: '+ Dorayaki & Cake' },
                  { scene: 'starry-door' as const, label: '+ Starry Anywhere Door' },
                  { scene: 'summer-beach' as const, label: '+ Summer Cloud Beach' },
                ].map((item) => (
                  <button
                    key={item.scene}
                    type="button"
                    onClick={() =>
                      handleAddSceneMemory(item.scene, item.label.replace('+ ', ''))
                    }
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#64C8FF]/25 text-[#183247] border border-[#64C8FF]/60 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add by Image URL Form */}
            <form
              onSubmit={handleAddCustomUrlMemory}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 bg-[#EAF7FF]/40 p-3.5 rounded-2xl border border-[#64C8FF]/40"
            >
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="Paste image URL (https://...)"
                aria-label="Custom Image URL"
                className="sm:col-span-5 px-3 py-2 rounded-xl bg-white border border-[#64C8FF] text-xs text-[#183247]"
              />
              <input
                type="text"
                value={customImageCaption}
                onChange={(e) => setCustomImageCaption(e.target.value)}
                placeholder="Caption for this photo"
                aria-label="Custom Photo Caption"
                className="sm:col-span-5 px-3 py-2 rounded-xl bg-white border border-[#64C8FF] text-xs text-[#183247]"
              />
              <button
                type="submit"
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-[#168DCE] hover:bg-[#1276AD] text-white text-xs font-semibold flex items-center justify-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>

            {/* Memory List with Reordering & Inline Editing */}
            {config.memories.length === 0 ? (
              <div className="text-center py-8 bg-[#EAF7FF]/50 rounded-2xl border border-dashed border-[#64C8FF] space-y-3">
                <p className="text-sm font-bold text-[#183247]">
                  Your gallery is currently empty.
                </p>
                <button
                  type="button"
                  onClick={() => updateField('memories', DEFAULT_MEMORIES)}
                  className="px-4 py-2 rounded-xl bg-[#168DCE] text-white text-xs font-semibold cursor-pointer"
                >
                  Restore Default Sky Memories
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {config.memories.map((memory, idx) => (
                  <div
                    key={memory.id}
                    className="p-4 rounded-2xl bg-[#EAF7FF]/45 border border-[#64C8FF]/50 flex flex-col sm:flex-row gap-4 items-start"
                  >
                    <div className="w-full sm:w-28 shrink-0 space-y-1.5">
                      <img
                        src={memory.imageUrl}
                        alt={memory.caption}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = createMemorySceneDataUri('sunset-hill');
                        }}
                        className="w-full h-24 object-cover rounded-xl border border-[#64C8FF]/40 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingCropMemory(memory)}
                        aria-label={`Edit or crop ${memory.caption}`}
                        className="w-full py-1.5 px-2 rounded-lg bg-[#168DCE] hover:bg-[#1276AD] text-white text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                      >
                        <Crop className="w-3 h-3" />
                        <span>Edit / Crop</span>
                      </button>
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={memory.caption}
                          aria-label={`Memory ${idx + 1} caption`}
                          onChange={(e) =>
                            handleUpdateMemory(memory.id, { caption: e.target.value })
                          }
                          placeholder="Memory title / caption"
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#64C8FF]/60 text-xs font-bold text-[#183247]"
                        />
                        <input
                          type="text"
                          value={memory.dateLabel}
                          aria-label={`Memory ${idx + 1} date or location`}
                          onChange={(e) =>
                            handleUpdateMemory(memory.id, { dateLabel: e.target.value })
                          }
                          placeholder="Date or place tag"
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#64C8FF]/60 text-xs text-[#168DCE]"
                        />
                      </div>
                      <input
                        type="text"
                        value={memory.story}
                        aria-label={`Memory ${idx + 1} story note`}
                        onChange={(e) =>
                          handleUpdateMemory(memory.id, { story: e.target.value })
                        }
                        placeholder="Short memory story..."
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#64C8FF]/60 text-xs text-[#183247]/80"
                      />
                    </div>

                    {/* Reorder & Remove Controls */}
                    <div className="flex sm:flex-col items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleMoveMemory(idx, 'up')}
                        disabled={idx === 0}
                        aria-label={`Move ${memory.caption} up`}
                        className="p-1.5 rounded-lg bg-white hover:bg-[#EAF7FF] disabled:opacity-35 text-[#183247] border border-[#64C8FF]/40 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveMemory(idx, 'down')}
                        disabled={idx === config.memories.length - 1}
                        aria-label={`Move ${memory.caption} down`}
                        className="p-1.5 rounded-lg bg-white hover:bg-[#EAF7FF] disabled:opacity-35 text-[#183247] border border-[#64C8FF]/40 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMemory(memory.id)}
                        aria-label={`Remove ${memory.caption}`}
                        className="p-1.5 rounded-lg bg-white hover:bg-[#F04444]/10 text-[#F04444] border border-[#F04444]/30 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Photo Crop & Visual Enhancement Modal */}
            {editingCropMemory && (
              <PhotoCropEditorModal
                memory={editingCropMemory}
                onClose={() => setEditingCropMemory(null)}
                onSave={handleSaveCroppedPhoto}
              />
            )}
          </div>
        )}

        {/* TAB C: BIRTHDAY EXPERIENCE (SECTIONS, GADGETS, LETTER, WISHES, FUNNY MOMENTS) */}
        {activeTab === 'experience' && (
          <div className="space-y-7">
            {/* Background Music Selector & Upload */}
            {renderMusicSettingsSection()}

            {/* Section Visibility Toggles */}
            <div className="space-y-3">
              <h2 className="font-display text-xl font-bold text-[#183247]">
                Show or Hide Experience Sections ✨
              </h2>
              <p className="text-xs text-[#183247]/70">
                Customize which interactive chapters appear in your birthday microsite.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {(
                  [
                    {
                      key: 'showMemoriesGallery',
                      label: 'Photo & Memory Gallery 📸',
                    },
                    {
                      key: 'showGadgetSurprises',
                      label: '4D Pocket Gadget Surprises 🎁',
                    },
                    {
                      key: 'showFunnyMoments',
                      label: 'Funny Moments Highlights 😄',
                    },
                    {
                      key: 'showHeartfeltLetter',
                      label: 'Heartfelt Birthday Letter 💌',
                    },
                    {
                      key: 'showFriendsWishes',
                      label: 'Friends & Crew Wishes 🌟',
                    },
                  ] as const
                ).map((item) => {
                  const isVisible = config.sections[item.key];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        updateField('sections', {
                          ...config.sections,
                          [item.key]: !isVisible,
                        })
                      }
                      className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        isVisible
                          ? 'bg-[#EAF7FF] border-[#168DCE] text-[#183247]'
                          : 'bg-white border-[#64C8FF]/40 text-[#183247]/55'
                      }`}
                    >
                      <span className="text-xs font-bold">{item.label}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#168DCE] shrink-0">
                        {isVisible ? (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Visible
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Hidden
                          </>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Heartfelt Letter Editor */}
            <div className="space-y-3 pt-4 border-t border-[#EAF7FF]">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-[#183247]">
                  Heartfelt Birthday Letter 💌
                </h3>
                <button
                  type="button"
                  onClick={() => onJumpToPreviewStep('letter')}
                  className="text-xs font-semibold text-[#168DCE] hover:underline cursor-pointer"
                >
                  Preview Letter Step →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={config.letterGreeting}
                  aria-label="Letter Greeting"
                  onChange={(e) => {
                    updateField('letterGreeting', e.target.value);
                    onJumpToPreviewStep('letter');
                  }}
                  placeholder="Dearest Nobita,"
                  className="px-3.5 py-2 rounded-xl bg-[#EAF7FF]/50 border border-[#64C8FF] text-xs font-bold text-[#183247]"
                />
                <input
                  type="text"
                  value={config.letterSignOff}
                  aria-label="Letter Sign-Off"
                  onChange={(e) => {
                    updateField('letterSignOff', e.target.value);
                    onJumpToPreviewStep('letter');
                  }}
                  placeholder="With love, Doraemon 🔔💙"
                  className="px-3.5 py-2 rounded-xl bg-[#EAF7FF]/50 border border-[#64C8FF] text-xs font-bold text-[#183247]"
                />
              </div>

              <textarea
                rows={4}
                value={config.letterBody}
                aria-label="Heartfelt Birthday Letter Body"
                onChange={(e) => {
                  updateField('letterBody', e.target.value);
                  onJumpToPreviewStep('letter');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#EAF7FF]/50 border border-[#64C8FF] text-xs sm:text-sm text-[#183247] leading-relaxed"
              />
            </div>

            {/* 4D Pocket Gadget Surprises Editor */}
            <div className="space-y-3 pt-4 border-t border-[#EAF7FF]">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-[#183247]">
                  4D Pocket Gadget Surprises 🎁
                </h3>
                <button
                  type="button"
                  onClick={() => onJumpToPreviewStep('surprises')}
                  className="text-xs font-semibold text-[#168DCE] hover:underline cursor-pointer"
                >
                  Preview 4D Pocket →
                </button>
              </div>

              <div className="space-y-2.5">
                {config.gadgetSurprises.map((gad) => (
                  <div
                    key={gad.id}
                    className="p-3.5 rounded-2xl bg-[#EAF7FF]/45 border border-[#64C8FF]/50 flex items-start gap-3"
                  >
                    <GadgetIllustration
                      gadget={gad.gadget as GadgetKey}
                      className="w-9 h-9 shrink-0 mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={gad.surpriseTitle}
                          aria-label={`${gad.gadgetName} surprise title`}
                          onChange={(e) => {
                            updateField(
                              'gadgetSurprises',
                              config.gadgetSurprises.map((item) =>
                                item.id === gad.id
                                  ? { ...item, surpriseTitle: e.target.value }
                                  : item
                              )
                            );
                            onJumpToPreviewStep('surprises');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#64C8FF]/60 text-xs font-bold text-[#183247]"
                        />
                        <input
                          type="text"
                          value={gad.unlockedHint}
                          aria-label={`${gad.gadgetName} unlocked badge`}
                          onChange={(e) => {
                            updateField(
                              'gadgetSurprises',
                              config.gadgetSurprises.map((item) =>
                                item.id === gad.id
                                  ? { ...item, unlockedHint: e.target.value }
                                  : item
                              )
                            );
                            onJumpToPreviewStep('surprises');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#64C8FF]/60 text-xs text-[#168DCE]"
                        />
                      </div>
                      <input
                        type="text"
                        value={gad.surpriseMessage}
                        aria-label={`${gad.gadgetName} surprise message`}
                        onChange={(e) => {
                          updateField(
                            'gadgetSurprises',
                            config.gadgetSurprises.map((item) =>
                              item.id === gad.id
                                ? { ...item, surpriseMessage: e.target.value }
                                : item
                            )
                          );
                          onJumpToPreviewStep('surprises');
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#64C8FF]/60 text-xs text-[#183247]/80"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Friends & Crew Wishes Editor */}
            <div className="space-y-3 pt-4 border-t border-[#EAF7FF]">
              <h3 className="font-display text-base font-bold text-[#183247]">
                Friends &amp; Character Wishes 🌟
              </h3>

              <div className="space-y-2">
                {config.wishes.map((w) => (
                  <div
                    key={w.id}
                    className="p-3 rounded-xl bg-white border border-[#64C8FF]/50 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CharacterAvatar
                        character={w.character}
                        className="w-8 h-8 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#183247] truncate">
                          {w.senderName} ·{' '}
                          <span className="font-normal text-[#168DCE]">
                            {w.roleLabel}
                          </span>
                        </div>
                        <p className="text-xs text-[#183247]/70 truncate">
                          {w.message}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          'wishes',
                          config.wishes.filter((item) => item.id !== w.id)
                        )
                      }
                      aria-label={`Remove wish from ${w.senderName}`}
                      className="p-1.5 rounded-lg text-[#F04444] hover:bg-[#F04444]/10 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Wish Form */}
              <form
                onSubmit={handleAddWish}
                className="p-3.5 rounded-2xl bg-[#EAF7FF]/50 border border-[#64C8FF]/50 space-y-2.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newWishSender}
                    onChange={(e) => setNewWishSender(e.target.value)}
                    placeholder="Friend's Name"
                    aria-label="New Wish Friend Name"
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#64C8FF] text-xs"
                  />
                  <input
                    type="text"
                    value={newWishRole}
                    onChange={(e) => setNewWishRole(e.target.value)}
                    placeholder="Role (e.g. Childhood Friend)"
                    aria-label="New Wish Friend Role"
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#64C8FF] text-xs"
                  />
                  <select
                    value={newWishCharacter}
                    onChange={(e) =>
                      setNewWishCharacter(e.target.value as CharacterKey)
                    }
                    aria-label="Character Avatar Badge"
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#64C8FF] text-xs"
                  >
                    <option value="doraemon">Doraemon Avatar</option>
                    <option value="shizuka">Shizuka Avatar</option>
                    <option value="nobita">Nobita Avatar</option>
                    <option value="gian">Gian Avatar</option>
                    <option value="suneo">Suneo Avatar</option>
                    <option value="dorami">Dorami Avatar</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newWishMessage}
                    onChange={(e) => setNewWishMessage(e.target.value)}
                    placeholder="Write their birthday wish..."
                    aria-label="New Wish Message"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#64C8FF] text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#168DCE] text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    + Add Wish
                  </button>
                </div>
              </form>
            </div>

            {/* Funny Moments Editor */}
            <div className="space-y-3 pt-4 border-t border-[#EAF7FF]">
              <h3 className="font-display text-base font-bold text-[#183247]">
                Funny Moments &amp; Inside Jokes 😄
              </h3>

              <div className="space-y-2">
                {config.funnyMoments.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-white border border-[#64C8FF]/50 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#183247] truncate">
                        {m.emoji} {m.title} ·{' '}
                        <span className="font-normal text-[#168DCE]">
                          {m.episodeTag}
                        </span>
                      </div>
                      <p className="text-xs text-[#183247]/70 truncate">
                        {m.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          'funnyMoments',
                          config.funnyMoments.filter((item) => item.id !== m.id)
                        )
                      }
                      aria-label={`Remove funny moment ${m.title}`}
                      className="p-1.5 rounded-lg text-[#F04444] hover:bg-[#F04444]/10 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleAddFunnyMoment}
                className="p-3.5 rounded-2xl bg-[#EAF7FF]/50 border border-[#64C8FF]/50 space-y-2.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newMomentTitle}
                    onChange={(e) => setNewMomentTitle(e.target.value)}
                    placeholder="Funny Moment Title"
                    aria-label="New Funny Moment Title"
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#64C8FF] text-xs"
                  />
                  <input
                    type="text"
                    value={newMomentTag}
                    onChange={(e) => setNewMomentTag(e.target.value)}
                    placeholder="Episode Tag (e.g. Episode 04)"
                    aria-label="New Funny Moment Episode Tag"
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#64C8FF] text-xs"
                  />
                  <input
                    type="text"
                    value={newMomentEmoji}
                    onChange={(e) => setNewMomentEmoji(e.target.value)}
                    placeholder="Emoji (e.g. 🚁)"
                    aria-label="New Funny Moment Emoji"
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#64C8FF] text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMomentDesc}
                    onChange={(e) => setNewMomentDesc(e.target.value)}
                    placeholder="Describe the funny memory..."
                    aria-label="New Funny Moment Description"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-[#64C8FF] text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#168DCE] text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    + Add Moment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB D: APPEARANCE */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-[#183247]">
                Theme &amp; Layout Customization 🎨
              </h2>
              <p className="text-xs text-[#183247]/70">
                Keep the signature white &amp; sky-blue Doraemon look while tailoring
                the card frame and accent highlights.
              </p>
            </div>

            {/* Curated Layout Selector */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-[#183247] block">
                1. Choose Microsite Card Layout
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(
                  [
                    {
                      id: 'classic-pocket' as LayoutStyle,
                      title: 'Classic 4D Pocket',
                      desc: 'Crisp white surface with Doraemon sky-blue border.',
                    },
                    {
                      id: 'anywhere-storybook' as LayoutStyle,
                      title: 'Anywhere Door Storybook',
                      desc: 'Soft sky gradient with subtle pink door frame border.',
                    },
                    {
                      id: 'starlight-cloud' as LayoutStyle,
                      title: 'Golden Bell Cloud',
                      desc: 'Bright white card framed by a golden bell accent border.',
                    },
                  ] as const
                ).map((layoutItem) => {
                  const active = config.appearance.layout === layoutItem.id;
                  return (
                    <button
                      key={layoutItem.id}
                      type="button"
                      onClick={() =>
                        updateField('appearance', {
                          ...config.appearance,
                          layout: layoutItem.id,
                        })
                      }
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        active
                          ? 'bg-[#EAF7FF] border-[#168DCE] shadow-xs'
                          : 'bg-white border-[#64C8FF]/40 hover:border-[#64C8FF]'
                      }`}
                    >
                      <div className="font-display font-bold text-sm text-[#183247]">
                        {layoutItem.title}
                      </div>
                      <p className="text-xs text-[#183247]/70 mt-1">
                        {layoutItem.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subtle Accent Highlight Selector */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-[#183247] block">
                2. Primary Action Accent Color
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(
                  [
                    {
                      id: 'dora-blue' as AccentTheme,
                      label: 'Deep Blue',
                      swatch: '#168DCE',
                    },
                    {
                      id: 'bell-gold' as AccentTheme,
                      label: 'Bell Yellow',
                      swatch: '#FFD84D',
                    },
                    {
                      id: 'collar-red' as AccentTheme,
                      label: 'Collar Red',
                      swatch: '#F04444',
                    },
                    {
                      id: 'dorami-sky' as AccentTheme,
                      label: 'Sky Blue',
                      swatch: '#64C8FF',
                    },
                  ] as const
                ).map((acc) => {
                  const active = config.appearance.accent === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() =>
                        updateField('appearance', {
                          ...config.appearance,
                          accent: acc.id,
                        })
                      }
                      className={`p-3 rounded-xl border-2 flex items-center gap-2.5 cursor-pointer ${
                        active
                          ? 'bg-[#EAF7FF] border-[#168DCE]'
                          : 'bg-white border-[#64C8FF]/40'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-[#183247]/30 shrink-0"
                        style={{ backgroundColor: acc.swatch }}
                      />
                      <span className="text-xs font-bold text-[#183247] truncate">
                        {acc.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Atmosphere Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-[#EAF7FF]">
              <span className="text-xs font-bold text-[#183247] block">
                3. Atmosphere &amp; Interactive Effects
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    updateField('appearance', {
                      ...config.appearance,
                      floatingAnimations: !config.appearance.floatingAnimations,
                    })
                  }
                  className="p-3.5 rounded-xl bg-[#EAF7FF]/60 border border-[#64C8FF]/50 text-left flex items-center justify-between cursor-pointer"
                >
                  <span className="text-xs font-bold text-[#183247]">
                    Floating Clouds ☁️
                  </span>
                  <span className="text-xs font-semibold text-[#168DCE]">
                    {config.appearance.floatingAnimations ? 'On' : 'Paused'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateField('appearance', {
                      ...config.appearance,
                      soundChimes: !config.appearance.soundChimes,
                    })
                  }
                  className="p-3.5 rounded-xl bg-[#EAF7FF]/60 border border-[#64C8FF]/50 text-left flex items-center justify-between cursor-pointer"
                >
                  <span className="text-xs font-bold text-[#183247]">
                    Bell Chimes 🔔
                  </span>
                  <span className="text-xs font-semibold text-[#168DCE]">
                    {config.appearance.soundChimes ? 'On' : 'Muted'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateField('appearance', {
                      ...config.appearance,
                      showDoraemonBellBadge:
                        !config.appearance.showDoraemonBellBadge,
                    })
                  }
                  className="p-3.5 rounded-xl bg-[#EAF7FF]/60 border border-[#64C8FF]/50 text-left flex items-center justify-between cursor-pointer"
                >
                  <span className="text-xs font-bold text-[#183247]">
                    Header Bell Icon
                  </span>
                  <span className="text-xs font-semibold text-[#168DCE]">
                    {config.appearance.showDoraemonBellBadge ? 'Shown' : 'Hidden'}
                  </span>
                </button>
              </div>
            </div>

            {/* 4. Background Music Track Selector & Upload */}
            <div className="pt-2 border-t border-[#EAF7FF]">
              {renderMusicSettingsSection()}
            </div>
          </div>
        )}

        {/* TAB E: PREVIEW & SHARE */}
        {activeTab === 'share' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-[#183247]">
                Save Draft &amp; Share Birthday Surprise 🎉
              </h2>
              <p className="text-xs text-[#183247]/70">
                Save your work locally, generate a compact short-ID share link
                for {config.recipientName || 'your friend'}, or export a
                self-contained HTML file.
              </p>
            </div>

            {/* 1. Compact Short-ID Shareable Birthday Website Link */}
            <div className="p-5 rounded-2xl bg-[#EAF7FF] border border-[#64C8FF] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#168DCE]">
                  Compact Shareable Link (Short ID · Opens Fullscreen Experience)
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => publishShareConfiguration(false)}
                    disabled={isPublishingShare}
                    className="text-xs font-semibold text-[#183247]/75 hover:text-[#168DCE] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        isPublishingShare ? 'animate-spin text-[#168DCE]' : ''
                      }`}
                    />
                    Sync Latest Changes
                  </button>
                  <button
                    type="button"
                    onClick={onOpenFullscreenExperience}
                    className="text-xs font-semibold text-[#168DCE] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Launch Fullscreen Now
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  readOnly
                  value={
                    isPublishingShare && !shareId
                      ? 'Generating compact short link...'
                      : shareUrlPreview
                  }
                  aria-label="Shareable Birthday Website URL"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#64C8FF] text-xs text-[#183247] font-mono-num select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  disabled={isPublishingShare}
                  className="px-5 py-2.5 rounded-xl bg-[#168DCE] hover:bg-[#1276AD] disabled:opacity-60 text-white font-semibold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isPublishingShare ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving &amp; Copying...
                    </>
                  ) : copiedLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied Link!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Share Link
                    </>
                  )}
                </button>
              </div>

              {/* Loading, Success, and Error Feedback */}
              {isPublishingShare && (
                <div
                  role="status"
                  className="flex items-center gap-2 text-xs font-semibold text-[#168DCE] bg-white/80 px-3 py-2 rounded-xl border border-[#64C8FF]/50"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span>
                    Storing photos &amp; birthday configuration under short ID...
                  </span>
                </div>
              )}

              {!isPublishingShare && shareSuccessMsg && !shareErrorMsg && (
                <div
                  role="status"
                  className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#183247] bg-white px-3.5 py-2.5 rounded-xl border border-[#64C8FF]"
                >
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#168DCE] shrink-0" />
                    <span>{shareSuccessMsg}</span>
                  </span>
                  {shareId && (
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenShareLink) {
                            onOpenShareLink(shareId);
                          } else {
                            onOpenFullscreenExperience();
                          }
                        }}
                        className="text-[#168DCE] font-bold hover:underline whitespace-nowrap cursor-pointer"
                      >
                        Open Short Link →
                      </button>
                      <a
                        href={shareUrlPreview}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#183247]/70 hover:text-[#168DCE] hover:underline whitespace-nowrap flex items-center gap-1"
                      >
                        <span>New Tab</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {shareErrorMsg && (
                <div
                  role="alert"
                  className="flex items-center gap-2 text-xs font-semibold text-[#F04444] bg-[#F04444]/10 px-3.5 py-2 rounded-xl border border-[#F04444]/30"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{shareErrorMsg}</span>
                </div>
              )}

              <p className="text-[11px] text-[#183247]/70">
                Your custom text, wishes, uploaded photos, and layout are stored
                on the server under a short ID (
                <code className="font-semibold text-[#168DCE]">
                  ?s={shareId || 'dora...'}
                </code>
                ) so the link stays compact and never triggers URL length errors.
              </p>
            </div>

            {/* 2. Self-Contained HTML Surprise Export */}
            <div className="p-4 rounded-2xl bg-white border border-[#64C8FF]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="font-display font-bold text-sm text-[#183247] flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-[#168DCE]" />
                  <span>Self-Contained HTML Birthday File (.html)</span>
                </h3>
                <p className="text-xs text-[#183247]/70">
                  Download a standalone HTML file with all wishes, photos, and
                  4D Pocket surprises that opens in any browser offline.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportStandaloneHtml}
                className="px-4 py-2.5 rounded-xl bg-[#FFD84D] hover:bg-[#F5CA2E] text-[#183247] text-xs font-display font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download HTML Surprise 🎂
              </button>
            </div>

            {/* 3. Local Draft Persistence vs JSON Backup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#64C8FF]/50 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm text-[#183247]">
                    Local Browser Draft
                  </h3>
                  <p className="text-xs text-[#183247]/70">
                    Saves your progress including uploaded photos in this browser.
                    {lastSavedAt ? ` Last saved at ${lastSavedAt}.` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSaveDraft();
                      showToast('Draft saved to local browser storage 💾');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#168DCE] hover:bg-[#1276AD] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Draft Now
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onResetDefault();
                      showToast('Reset birthday studio to default Nobita template 🔄');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#EAF7FF] hover:bg-[#64C8FF]/30 text-[#183247] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Defaults
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#64C8FF]/50 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm text-[#183247]">
                    Portable JSON File Backup
                  </h3>
                  <p className="text-xs text-[#183247]/70">
                    Download your complete birthday project (including uploaded
                    photos) or load a saved file.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="px-4 py-2 rounded-xl bg-[#EAF7FF] hover:bg-[#64C8FF]/30 text-[#183247] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export JSON
                  </button>
                  <input
                    ref={jsonImportRef}
                    type="file"
                    accept="application/json,.json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => jsonImportRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-[#EAF7FF] hover:bg-[#64C8FF]/30 text-[#183247] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Import JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
