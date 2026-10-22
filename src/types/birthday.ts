export type CharacterKey = 'doraemon' | 'nobita' | 'shizuka' | 'gian' | 'suneo' | 'dorami';

export type GadgetKey =
  | 'anywhere-door'
  | 'bamboo-copter'
  | 'memory-bread'
  | 'time-kerchief'
  | 'dress-up-camera'
  | 'big-light';

export interface PhotoMemory {
  id: string;
  imageUrl: string;
  caption: string;
  dateLabel: string;
  story: string;
  scenePreset?: 'sunset-hill' | 'birthday-cake' | 'starry-door' | 'summer-beach';
}

export interface WishItem {
  id: string;
  senderName: string;
  character: CharacterKey;
  roleLabel: string;
  message: string;
}

export interface FunnyMoment {
  id: string;
  title: string;
  episodeTag: string;
  description: string;
  emoji: string;
}

export interface GadgetSurprise {
  id: string;
  gadget: GadgetKey;
  gadgetName: string;
  surpriseTitle: string;
  surpriseMessage: string;
  unlockedHint: string;
}

export interface SectionVisibility {
  showMemoriesGallery: boolean;
  showGadgetSurprises: boolean;
  showFunnyMoments: boolean;
  showHeartfeltLetter: boolean;
  showFriendsWishes: boolean;
}

export type LayoutStyle = 'classic-pocket' | 'anywhere-storybook' | 'starlight-cloud';
export type AccentTheme = 'dora-blue' | 'bell-gold' | 'collar-red' | 'dorami-sky';

export type MusicTrackSource =
  | 'youtube'
  | 'synth-dora-march'
  | 'synth-music-box'
  | 'synth-birthday-bell'
  | 'custom-upload';

export interface MusicConfig {
  source: MusicTrackSource;
  trackTitle: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  customAudioDataUrl?: string;
  customFileName?: string;
  volume: number; // 0 to 100
}

export interface AppearanceConfig {
  layout: LayoutStyle;
  accent: AccentTheme;
  floatingAnimations: boolean;
  soundChimes: boolean;
  showDoraemonBellBadge: boolean;
}

export interface BirthdayConfig {
  // (a) Birthday Details
  recipientName: string;
  age: number;
  birthdayDate: string;
  nickname: string;
  senderName: string;
  relationship: string;
  headline: string;
  personalMessage: string;

  // (b) Photos & Memories
  memories: PhotoMemory[];

  // (c) Birthday Experience
  letterGreeting: string;
  letterBody: string;
  letterSignOff: string;
  wishes: WishItem[];
  funnyMoments: FunnyMoment[];
  gadgetSurprises: GadgetSurprise[];
  sections: SectionVisibility;

  // (d) Appearance & Music
  appearance: AppearanceConfig;
  music: MusicConfig;

  // Final Greeting
  finalHeadline: string;
  finalSubtext: string;
}

export type EditorTabId =
  | 'details'
  | 'memories'
  | 'experience'
  | 'appearance'
  | 'share';

export type ExperienceStepId =
  | 'welcome'
  | 'milestone'
  | 'memories'
  | 'surprises'
  | 'letter'
  | 'finale';

export interface ExperienceStepMeta {
  id: ExperienceStepId;
  index: number;
  title: string;
  shortLabel: string;
  emoji: string;
}
