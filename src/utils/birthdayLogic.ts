import {
  BirthdayConfig,
  ExperienceStepMeta,
  PhotoMemory,
  SectionVisibility,
} from '../types/birthday';

export const STORAGE_DRAFT_KEY = 'dorapocket_birthday_draft_v3';
export const DEFAULT_RECIPIENT_PLACEHOLDER = 'Birthday Star';
export const DEFAULT_SENDER_PLACEHOLDER = 'Your Besties';

/**
 * Generates crisp, self-contained anime-style SVG data URIs so default memories
 * render rich artwork offline/online with zero broken image links.
 */
export function createMemorySceneDataUri(
  scene: 'sunset-hill' | 'birthday-cake' | 'starry-door' | 'summer-beach'
): string {
  const svgs: Record<typeof scene, string> = {
    'sunset-hill': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#168DCE"/>
          <stop offset="48%" stop-color="#64C8FF"/>
          <stop offset="82%" stop-color="#FFE49E"/>
          <stop offset="100%" stop-color="#FFD84D"/>
        </linearGradient>
        <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#48B885"/>
          <stop offset="100%" stop-color="#1D7A58"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#sky1)"/>
      <circle cx="620" cy="240" r="68" fill="#FFF7D6" opacity="0.88"/>
      <circle cx="620" cy="240" r="46" fill="#FFD84D"/>
      <g fill="#FFFFFF" opacity="0.92">
        <path d="M120 150 Q145 115 185 130 Q215 100 255 125 Q290 120 300 150 Z"/>
        <path d="M450 110 Q480 75 520 92 Q555 68 595 95 Q625 90 635 118 Z"/>
      </g>
      <path d="M0 440 Q220 350 480 415 T800 390 L800 600 L0 600 Z" fill="#2E966C" opacity="0.7"/>
      <path d="M0 460 Q280 370 590 450 T800 440 L800 600 L0 600 Z" fill="url(#hill1)"/>
      <!-- Bamboo copter silhouettes floating in the sky -->
      <g transform="translate(350, 210)">
        <circle cx="0" cy="0" r="24" fill="#64C8FF" stroke="#FFFFFF" stroke-width="3"/>
        <rect x="-14" y="18" width="28" height="6" rx="3" fill="#F04444"/>
        <circle cx="0" cy="22" r="5" fill="#FFD84D"/>
        <line x1="0" y1="-24" x2="0" y2="-36" stroke="#FFD84D" stroke-width="3"/>
        <ellipse cx="0" cy="-37" rx="22" ry="4" fill="#FFD84D"/>
      </g>
      <g transform="translate(420, 230)">
        <circle cx="0" cy="0" r="20" fill="#183247" stroke="#FFFFFF" stroke-width="2.5"/>
        <rect x="-16" y="18" width="32" height="18" rx="6" fill="#FFD84D"/>
        <line x1="0" y1="-20" x2="0" y2="-32" stroke="#FFD84D" stroke-width="3"/>
        <ellipse cx="0" cy="-33" rx="20" ry="3.5" fill="#FFD84D"/>
      </g>
      <!-- Three iconic stacked cement pipes on the grassy lot -->
      <g transform="translate(150, 405)">
        <rect x="0" y="25" width="95" height="38" rx="8" fill="#DCE9F2" stroke="#9BB6C9" stroke-width="3"/>
        <rect x="100" y="25" width="95" height="38" rx="8" fill="#DCE9F2" stroke="#9BB6C9" stroke-width="3"/>
        <rect x="50" y="-12" width="95" height="38" rx="8" fill="#EAF7FF" stroke="#9BB6C9" stroke-width="3"/>
      </g>
    </svg>`,

    'birthday-cake': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#EAF7FF"/>
          <stop offset="50%" stop-color="#D0EEFF"/>
          <stop offset="100%" stop-color="#9BD9FF"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bg2)"/>
      <!-- Festive bunting flags -->
      <path d="M50 60 L130 60 L90 125 Z" fill="#64C8FF"/>
      <path d="M160 60 L240 60 L200 125 Z" fill="#FFD84D"/>
      <path d="M270 60 L350 60 L310 125 Z" fill="#F04444"/>
      <path d="M380 60 L460 60 L420 125 Z" fill="#64C8FF"/>
      <path d="M490 60 L570 60 L530 125 Z" fill="#FFD84D"/>
      <path d="M600 60 L680 60 L640 125 Z" fill="#F04444"/>
      <!-- Table -->
      <ellipse cx="400" cy="480" rx="310" ry="70" fill="#FFFFFF" stroke="#64C8FF" stroke-width="5"/>
      <!-- Cake plate -->
      <ellipse cx="400" cy="445" rx="180" ry="34" fill="#EAF7FF" stroke="#168DCE" stroke-width="3"/>
      <!-- Cake base -->
      <rect x="260" y="310" width="280" height="125" rx="24" fill="#FFF9EB" stroke="#183247" stroke-width="4"/>
      <!-- Frosting drips -->
      <path d="M260 335 Q295 365 330 335 Q365 365 400 335 Q435 365 470 335 Q505 365 540 335 L540 310 L260 310 Z" fill="#FFFFFF" stroke="#183247" stroke-width="4"/>
      <!-- Doraemon collar ribbon around cake -->
      <rect x="260" y="395" width="280" height="22" fill="#F04444"/>
      <circle cx="400" cy="406" r="18" fill="#FFD84D" stroke="#183247" stroke-width="3"/>
      <circle cx="400" cy="410" r="4" fill="#183247"/>
      <!-- Candles & strawberries -->
      <circle cx="305" cy="304" r="14" fill="#F04444"/>
      <circle cx="495" cy="304" r="14" fill="#F04444"/>
      <rect x="350" y="245" width="14" height="65" rx="5" fill="#64C8FF" stroke="#183247" stroke-width="3"/>
      <rect x="393" y="235" width="14" height="75" rx="5" fill="#FFD84D" stroke="#183247" stroke-width="3"/>
      <rect x="436" y="245" width="14" height="65" rx="5" fill="#F04444" stroke="#183247" stroke-width="3"/>
      <!-- Candle flames -->
      <path d="M357 215 Q370 232 357 242 Q344 232 357 215 Z" fill="#FFD84D"/>
      <path d="M400 205 Q413 222 400 232 Q387 222 400 205 Z" fill="#FFD84D"/>
      <path d="M443 215 Q456 232 443 242 Q430 232 443 215 Z" fill="#FFD84D"/>
    </svg>`,

    'starry-door': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#183247"/>
          <stop offset="55%" stop-color="#168DCE"/>
          <stop offset="100%" stop-color="#64C8FF"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#nightSky)"/>
      <!-- Twinkling stars -->
      <g fill="#FFD84D">
        <circle cx="130" cy="110" r="6"/>
        <circle cx="240" cy="80" r="4"/>
        <circle cx="650" cy="120" r="7"/>
        <circle cx="560" cy="70" r="4.5"/>
        <circle cx="710" cy="230" r="5"/>
        <circle cx="110" cy="270" r="5"/>
        <path d="M200 170 L206 186 L222 192 L206 198 L200 214 L194 198 L178 192 L194 186 Z"/>
        <path d="M610 190 L616 206 L632 212 L616 218 L610 234 L604 218 L588 212 L604 206 Z"/>
      </g>
      <!-- Clouds base -->
      <ellipse cx="400" cy="500" rx="280" ry="65" fill="#EAF7FF"/>
      <ellipse cx="240" cy="515" rx="160" ry="50" fill="#FFFFFF"/>
      <ellipse cx="560" cy="515" rx="160" ry="50" fill="#FFFFFF"/>
      <!-- Anywhere Door Frame -->
      <rect x="305" y="150" width="190" height="330" rx="14" fill="#FF7EB3" stroke="#183247" stroke-width="5"/>
      <rect x="323" y="168" width="154" height="296" rx="8" fill="#FF9EC7" stroke="#183247" stroke-width="3"/>
      <rect x="342" y="190" width="116" height="115" rx="6" fill="#EAF7FF" stroke="#183247" stroke-width="3"/>
      <rect x="342" y="325" width="116" height="115" rx="6" fill="#FFD1E6" stroke="#183247" stroke-width="3"/>
      <circle cx="458" cy="315" r="10" fill="#FFD84D" stroke="#183247" stroke-width="3"/>
    </svg>`,

    'summer-beach': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="summerSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#168DCE"/>
          <stop offset="65%" stop-color="#64C8FF"/>
          <stop offset="100%" stop-color="#EAF7FF"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#summerSky)"/>
      <!-- Giant cumulus cloud -->
      <g fill="#FFFFFF">
        <circle cx="280" cy="240" r="75"/>
        <circle cx="380" cy="200" r="95"/>
        <circle cx="490" cy="225" r="80"/>
        <circle cx="570" cy="265" r="60"/>
        <rect x="220" y="240" width="370" height="85" rx="35"/>
      </g>
      <!-- Ocean -->
      <rect x="0" y="360" width="800" height="140" fill="#168DCE"/>
      <path d="M0 410 Q200 390 400 410 T800 410 L800 520 L0 520 Z" fill="#64C8FF"/>
      <!-- Sandy beach -->
      <path d="M0 485 Q320 450 800 495 L800 600 L0 600 Z" fill="#FFF2C2"/>
      <!-- Dorayaki picnic & Bell beach ball -->
      <circle cx="580" cy="515" r="42" fill="#64C8FF" stroke="#FFFFFF" stroke-width="6"/>
      <path d="M540 515 Q580 535 620 515" fill="none" stroke="#F04444" stroke-width="6"/>
      <circle cx="580" cy="522" r="9" fill="#FFD84D" stroke="#183247" stroke-width="2.5"/>
    </svg>`,
  };

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgs[scene])}`;
}

export const DEFAULT_MEMORIES: PhotoMemory[] = [
  {
    id: 'mem-1',
    imageUrl: createMemorySceneDataUri('sunset-hill'),
    caption: 'Golden Hour on the Hilltop',
    dateLabel: 'Summer 2025 · Secret Base',
    story: 'That afternoon we watched the clouds drift past the neighborhood and laughed until the streetlights came on.',
    scenePreset: 'sunset-hill',
  },
  {
    id: 'mem-2',
    imageUrl: createMemorySceneDataUri('birthday-cake'),
    caption: 'Dorayaki & Strawberry Shortcake Feast',
    dateLabel: 'Birthday Eve · Sweetest Table',
    story: 'No birthday is complete without extra strawberries, golden dorayaki pancakes, and three big wishes!',
    scenePreset: 'birthday-cake',
  },
  {
    id: 'mem-3',
    imageUrl: createMemorySceneDataUri('starry-door'),
    caption: 'Through the Anywhere Door',
    dateLabel: 'Midnight Stargazing · Cloud Deck',
    story: 'If we had an Anywhere Door, every single door handle would still lead back to hanging out together.',
    scenePreset: 'starry-door',
  },
  {
    id: 'mem-4',
    imageUrl: createMemorySceneDataUri('summer-beach'),
    caption: 'Endless Blue Sky Adventure',
    dateLabel: 'August Coastline · Blue Horizon',
    story: 'Chasing giant summer cumulus clouds under a 100% Doraemon sky-blue horizon.',
    scenePreset: 'summer-beach',
  },
];

export const DEFAULT_BIRTHDAY_CONFIG: BirthdayConfig = {
  recipientName: DEFAULT_RECIPIENT_PLACEHOLDER,
  age: 20,
  birthdayDate: new Date().toISOString().slice(0, 10),
  nickname: '',
  senderName: DEFAULT_SENDER_PLACEHOLDER,
  relationship: 'Best Friend',
  headline: 'Happy Birthday! 🎂✨',
  personalMessage:
    'Even without a single 22nd-century gadget from a four-dimensional pocket, your kindness, big heart, and energy already make everyone around you smile brighter than a sunny sky.',
  memories: DEFAULT_MEMORIES,
  letterGreeting: 'Dearest Birthday Star,',
  letterBody:
    'Looking back at every adventure and laugh we have shared, the real magic was never inside the 4D Pocket—it was how you never stopped bringing warmth and joy to everyone around you.\n\nAs you turn 20 today, may your skies always stay clear and bright blue, may your plate always have your favorite treats waiting, and may every door you open lead to a year full of courage, laughter, and unforgettable memories.',
  letterSignOff: 'With a ringing golden bell & endless cheers, Your Besties 🔔💙',
  wishes: [
    {
      id: 'wish-1',
      senderName: 'Childhood Bestie',
      character: 'shizuka',
      roleLabel: 'Best Friend',
      message:
        'Happy Birthday! Baked a special strawberry cake in spirit just for today. Never lose your gentle heart! 🎂✨',
    },
    {
      id: 'wish-2',
      senderName: 'Squad MVP',
      character: 'gian',
      roleLabel: 'Partner in Crime',
      message:
        'Hey pal!! Today we are celebrating your big day at full volume! Have an epic year ahead! 🎤🎉',
    },
    {
      id: 'wish-3',
      senderName: 'Adventure Co-Pilot',
      character: 'suneo',
      roleLabel: 'Travel Buddy',
      message:
        'Happy Birthday! Next weekend our road trip and celebration treats are on me. Let us make this year legendary! ✈️🌟',
    },
    {
      id: 'wish-4',
      senderName: '22nd-Century Crew',
      character: 'dorami',
      roleLabel: 'Family & Friends',
      message:
        'Sending bright yellow ribbons and sunshine from the future! Wishing you 365 days of happiness and zero stress! 🎀💛',
    },
  ],
  funnyMoments: [
    {
      id: 'moment-1',
      title: 'The Great Alarm Clock Snooze Record',
      episodeTag: 'Episode 01 · Morning Dash',
      description:
        'Managed to hit snooze 7 times in 12 minutes and still arrived with toast in mouth right before the bell rang.',
      emoji: '⏰',
    },
    {
      id: 'moment-2',
      title: 'Memory Bread Cramming Session',
      episodeTag: 'Episode 02 · Exam Night',
      description:
        'Tried to memorize an entire textbook over midnight snacks and ended up falling asleep on page three.',
      emoji: '🍞',
    },
    {
      id: 'moment-3',
      title: 'Bamboo Copter Hair Day',
      episodeTag: 'Episode 03 · Windy Rooftop',
      description:
        'Took a shortcut across town in a headwind and showed up to the party with gravity-defying hair.',
      emoji: '🚁',
    },
  ],
  gadgetSurprises: [
    {
      id: 'gad-1',
      gadget: 'anywhere-door',
      gadgetName: 'Anywhere Door (Dokodemo Door)',
      surpriseTitle: '1 Free Weekend Trip Pass 🚪',
      surpriseMessage:
        'Open this pink door whenever you need a break! Good for one spontaneous road trip or café adventure together, my treat.',
      unlockedHint: 'Destination: Anywhere you want to go!',
    },
    {
      id: 'gad-2',
      gadget: 'bamboo-copter',
      gadgetName: 'Bamboo Copter (Take-copter)',
      surpriseTitle: 'Sky-High Rooftop Dinner 🚁',
      surpriseMessage:
        'Let us soar above the busy week with a sunset dinner overlooking the city lights.',
      unlockedHint: 'Altitude: Cloud Nine',
    },
    {
      id: 'gad-3',
      gadget: 'memory-bread',
      gadgetName: 'Memory Bread',
      surpriseTitle: 'Zero-Stress Free Pass 🍞',
      surpriseMessage:
        'Redeem this gadget on any busy week when you want chores, errands, or coffee runs handled for you!',
      unlockedHint: '100% Worry-Free Guarantee',
    },
    {
      id: 'gad-4',
      gadget: 'time-kerchief',
      gadgetName: 'Time Kerchief',
      surpriseTitle: 'Nostalgia Movie Marathon 🧣',
      surpriseMessage:
        'Flip the red-and-blue kerchief to rewind time for an all-night marathon of our favorite childhood movies & snacks.',
      unlockedHint: 'Time Setting: Childhood Gold',
    },
  ],
  sections: {
    showMemoriesGallery: true,
    showGadgetSurprises: true,
    showFunnyMoments: true,
    showHeartfeltLetter: true,
    showFriendsWishes: true,
  },
  appearance: {
    layout: 'classic-pocket',
    accent: 'dora-blue',
    floatingAnimations: true,
    soundChimes: true,
    showDoraemonBellBadge: true,
  },
  music: {
    source: 'youtube',
    trackTitle: 'Doraemon Cartoon Theme (Original)',
    youtubeUrl: 'https://www.youtube.com/watch?v=iwncGYFPxmU',
    youtubeVideoId: 'iwncGYFPxmU',
    volume: 75,
  },
  finalHeadline: 'Make a Wish & Blow Out the Candles! 🎂✨',
  finalSubtext:
    'Here is to another trip around the sun filled with blue skies, warm dorayaki, and pockets full of dreams.',
};

/**
 * Extracts an 11-character YouTube video ID from standard watch URLs, short youtu.be URLs,
 * embed URLs, shorts URLs, or bare 11-character video IDs.
 */
export function extractYouTubeVideoId(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Computes the ordered list of steps for the interactive Birthday Experience
 * based on which sections the user has enabled in the editor.
 */
export function getActiveExperienceSteps(
  sections: SectionVisibility
): ExperienceStepMeta[] {
  const rawSteps: Array<{
    id: ExperienceStepMeta['id'];
    title: string;
    shortLabel: string;
    emoji: string;
    enabled: boolean;
  }> = [
    {
      id: 'welcome',
      title: 'Anywhere Door Welcome',
      shortLabel: 'Welcome',
      emoji: '🚪',
      enabled: true,
    },
    {
      id: 'milestone',
      title: 'Birthday Milestone & Note',
      shortLabel: 'Milestone',
      emoji: '🎂',
      enabled: true,
    },
    {
      id: 'memories',
      title: 'Photo & Memory Gallery',
      shortLabel: 'Memories',
      emoji: '📸',
      enabled: sections.showMemoriesGallery,
    },
    {
      id: 'surprises',
      title: '4D Pocket & Funny Moments',
      shortLabel: '4D Pocket',
      emoji: '🎁',
      enabled: sections.showGadgetSurprises || sections.showFunnyMoments,
    },
    {
      id: 'letter',
      title: 'Letter & Friends Wishes',
      shortLabel: 'Wishes',
      emoji: '💌',
      enabled: sections.showHeartfeltLetter || sections.showFriendsWishes,
    },
    {
      id: 'finale',
      title: 'Make a Wish Finale',
      shortLabel: 'Finale',
      emoji: '🥳',
      enabled: true,
    },
  ];

  return rawSteps
    .filter((s) => s.enabled)
    .map((s, idx) => ({
      id: s.id,
      index: idx + 1,
      title: s.title,
      shortLabel: s.shortLabel,
      emoji: s.emoji,
    }));
}

/**
 * Pure helper to reorder items in a list without mutating the input array.
 */
export function moveItemInArray<T>(
  list: readonly T[],
  fromIndex: number,
  toIndex: number
): T[] {
  if (
    fromIndex < 0 ||
    fromIndex >= list.length ||
    toIndex < 0 ||
    toIndex >= list.length ||
    fromIndex === toIndex
  ) {
    return [...list];
  }
  const clone = [...list];
  const [moved] = clone.splice(fromIndex, 1);
  clone.splice(toIndex, 0, moved);
  return clone;
}

/**
 * Formats an integer age with its English ordinal suffix (e.g. 21 -> "21st").
 */
export function formatOrdinalAge(age: number): string {
  const safeAge = Number.isFinite(age) && age > 0 ? Math.floor(age) : 1;
  const mod100 = safeAge % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return `${safeAge}th`;
  }
  switch (safeAge % 10) {
    case 1:
      return `${safeAge}st`;
    case 2:
      return `${safeAge}nd`;
    case 3:
      return `${safeAge}rd`;
    default:
      return `${safeAge}th`;
  }
}

/**
 * Validates required fields in BirthdayConfig so forms never silently accept empty required values.
 */
export function validateBirthdayDetails(config: BirthdayConfig): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!config.recipientName || config.recipientName.trim().length === 0) {
    errors.recipientName = 'Please enter the birthday person’s name.';
  }
  if (!Number.isFinite(config.age) || config.age < 1 || config.age > 150) {
    errors.age = 'Age must be between 1 and 150.';
  }
  if (!config.senderName || config.senderName.trim().length === 0) {
    errors.senderName = 'Please enter who this birthday surprise is from.';
  }
  if (!config.headline || config.headline.trim().length === 0) {
    errors.headline = 'Please enter a birthday headline.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export const STORAGE_SHARE_ID_KEY = 'dorapocket_share_id_v3';

/**
 * Purges legacy localStorage keys (including any cached "Svetang" or "Nobita" examples)
 * so the website never shows hardcoded details or pictures of a previous example person.
 */
export function purgeLegacyStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const legacyKeys = [
      'dorapocket_birthday_draft_v1',
      'dorapocket_birthday_draft_v2',
      'dorapocket_share_id_v1',
      'dorapocket_share_id_v2',
      'dorapocket_share_cache_dorav4amjv',
    ];
    for (const k of legacyKeys) {
      window.localStorage.removeItem(k);
    }

    const keysToCheck: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith('dorapocket_')) {
        keysToCheck.push(key);
      }
    }

    for (const key of keysToCheck) {
      const val = window.localStorage.getItem(key) || '';
      const lower = val.toLowerCase();
      if (
        lower.includes('svetang') ||
        lower.includes('svetu') ||
        lower.includes('dorav4amjv') ||
        lower.includes('cropped-photo-c29ee7e5df85')
      ) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore storage access errors
  }
}

/**
 * Dynamically synchronizes the entire birthday website (headline, letter greeting,
 * age in letter body, sign-off, and final headline) whenever the user enters or edits
 * the birthday person's details in the editor.
 */
export function syncBirthdayConfigWithDetails(
  prevConfig: BirthdayConfig,
  patch: Partial<BirthdayConfig>
): BirthdayConfig {
  const merged: BirthdayConfig = {
    ...prevConfig,
    ...patch,
  };

  const prevName = (prevConfig.recipientName || '').trim();
  const nextName = (merged.recipientName || '').trim();
  const displayName =
    nextName && nextName !== DEFAULT_RECIPIENT_PLACEHOLDER
      ? nextName
      : 'Friend';

  // If recipientName changed, dynamically update headline, letterGreeting, finalHeadline, and clear stale Nobi-kun nickname
  if ('recipientName' in patch) {
    const prevAutoHeadline = `Happy Birthday, ${prevName}! 🎂`;
    if (
      !merged.headline ||
      merged.headline === 'Happy Birthday! 🎂✨' ||
      merged.headline === 'Happy Birthday, Nobita! 🎂' ||
      merged.headline === 'Happy Birthday, Friend! 🎂' ||
      merged.headline === prevAutoHeadline
    ) {
      merged.headline = nextName
        ? `Happy Birthday, ${nextName}! 🎂`
        : 'Happy Birthday! 🎂✨';
    }

    const prevAutoGreeting = `Dearest ${prevName},`;
    if (
      !merged.letterGreeting ||
      merged.letterGreeting === 'Dearest Birthday Star,' ||
      merged.letterGreeting === 'Dearest Nobita,' ||
      merged.letterGreeting === 'Dearest Friend,' ||
      merged.letterGreeting === prevAutoGreeting
    ) {
      merged.letterGreeting = `Dearest ${displayName},`;
    }

    if (
      merged.nickname === 'Nobi-kun' &&
      nextName.toLowerCase() !== 'nobita'
    ) {
      merged.nickname = '';
    }

    const prevAutoFinale = `Make a Wish, ${prevName}! 🎂✨`;
    if (
      !merged.finalHeadline ||
      merged.finalHeadline === 'Make a Wish & Blow Out the Candles! 🎂✨' ||
      merged.finalHeadline === prevAutoFinale
    ) {
      merged.finalHeadline = nextName
        ? `Make a Wish, ${nextName}! 🎂✨`
        : 'Make a Wish & Blow Out the Candles! 🎂✨';
    }
  }

  // If age changed, dynamically update "As you turn X today" in letterBody
  if ('age' in patch && Number.isFinite(merged.age) && merged.age > 0) {
    merged.letterBody = (merged.letterBody || '').replace(
      /As you turn \d+ today/gi,
      `As you turn ${merged.age} today`
    );
  }

  // If senderName changed, dynamically update letterSignOff
  if ('senderName' in patch) {
    const prevSender = (prevConfig.senderName || '').trim();
    const nextSender = (merged.senderName || '').trim();
    const displaySender =
      nextSender && nextSender !== DEFAULT_SENDER_PLACEHOLDER
        ? nextSender
        : 'Your Friends';

    const prevAutoSignOff = `With a ringing golden bell & endless cheers, ${prevSender} 🔔💙`;
    if (
      !merged.letterSignOff ||
      merged.letterSignOff.includes('Your Besties') ||
      merged.letterSignOff.includes('Doraemon') ||
      merged.letterSignOff === prevAutoSignOff
    ) {
      merged.letterSignOff = `With a ringing golden bell & endless cheers, ${displaySender} 🔔💙`;
    }
  }

  return merged;
}

/**
 * Resolves any remaining placeholder or default strings in a BirthdayConfig at render time
 * so the generated website always reflects the user's entered name, age, sender, and relationship.
 */
export function getPersonalizedViewConfig(config: BirthdayConfig): BirthdayConfig {
  const rawName = (config.recipientName || '').trim();
  const hasCustomName =
    rawName.length > 0 && rawName !== DEFAULT_RECIPIENT_PLACEHOLDER;
  const activeName = hasCustomName ? rawName : rawName || 'Birthday Star';

  const rawSender = (config.senderName || '').trim();
  const hasCustomSender =
    rawSender.length > 0 && rawSender !== DEFAULT_SENDER_PLACEHOLDER;
  const activeSender = hasCustomSender ? rawSender : rawSender || 'Your Besties';

  let nickname = config.nickname || '';
  if (nickname === 'Nobi-kun' && activeName.toLowerCase() !== 'nobita') {
    nickname = '';
  }

  let headline = config.headline || `Happy Birthday, ${activeName}! 🎂`;
  if (hasCustomName && (headline === 'Happy Birthday! 🎂✨' || headline.includes('Birthday Star') || (headline.includes('Nobita') && activeName.toLowerCase() !== 'nobita'))) {
    headline = `Happy Birthday, ${activeName}! 🎂`;
  }

  let letterGreeting = config.letterGreeting || `Dearest ${activeName},`;
  if (
    hasCustomName &&
    (letterGreeting.includes('Birthday Star') ||
      (letterGreeting.includes('Nobita') && activeName.toLowerCase() !== 'nobita'))
  ) {
    letterGreeting = `Dearest ${activeName},`;
  }

  let letterBody = config.letterBody || DEFAULT_BIRTHDAY_CONFIG.letterBody;
  if (Number.isFinite(config.age) && config.age > 0) {
    letterBody = letterBody.replace(
      /As you turn \d+ today/gi,
      `As you turn ${config.age} today`
    );
  }

  let letterSignOff = config.letterSignOff || `With endless cheers, ${activeSender} 🔔💙`;
  if (
    hasCustomSender &&
    (letterSignOff.includes('Your Besties') ||
      (letterSignOff.includes('Doraemon') && !activeSender.toLowerCase().includes('doraemon')))
  ) {
    letterSignOff = `With a ringing golden bell & endless cheers, ${activeSender} 🔔💙`;
  }

  return {
    ...config,
    recipientName: activeName,
    nickname,
    senderName: activeSender,
    headline,
    letterGreeting,
    letterBody,
    letterSignOff,
  };
}

/**
 * Generates a unique, compact short ID on the client (e.g., "dora-aarav-8x4k9m")
 * so every new birthday person gets their own fresh share link and never collides
 * with a previously created example.
 */
export function generateClientShareId(recipientName?: string): string {
  const raw =
    recipientName && recipientName !== DEFAULT_RECIPIENT_PLACEHOLDER
      ? recipientName
      : 'bday';
  const cleanSlug = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 8);
  const alphabet = '23456789abcdefghjkmnpqrstuvwxyz';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `dora${cleanSlug ? `-${cleanSlug}` : ''}-${suffix}`;
}

/**
 * Encodes a lightweight, URL-safe base64 payload of the BirthdayConfig for the URL hash (#d=...).
 * Browsers NEVER send the URL hash (#...) in HTTP requests to Nginx or Vercel, so this is
 * 100% immune to 414 Request-URI Too Large errors while allowing shared links to work
 * across devices and stateless deployments even without a database.
 */
export function encodeShareHashPayload(config: BirthdayConfig): string {
  try {
    const personalized = getPersonalizedViewConfig(config);
    const lightweightMemories = (personalized.memories || []).map((m) => {
      // Keep server URLs, external URLs, and compressed photo data URLs (< 450KB); fallback huge raw base64 to scenePreset
      const isCompact =
        typeof m.imageUrl === 'string' &&
        (!m.imageUrl.startsWith('data:') || m.imageUrl.length < 450000);
      return {
        ...m,
        imageUrl: isCompact
          ? m.imageUrl
          : createMemorySceneDataUri(m.scenePreset || 'sunset-hill'),
      };
    });

    const payloadObj: Partial<BirthdayConfig> = {
      ...personalized,
      memories: lightweightMemories,
      music: {
        ...personalized.music,
        customAudioDataUrl: undefined,
      },
    };

    const json = JSON.stringify(payloadObj);
    const utf8Bytes = encodeURIComponent(json);
    const base64 =
      typeof btoa === 'function'
        ? btoa(utf8Bytes)
        : Buffer.from(utf8Bytes, 'utf-8').toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
}

/**
 * Decodes a BirthdayConfig from a URL hash fragment (#d=...).
 */
export function decodeShareHashPayload(
  hash: string
): Partial<BirthdayConfig> | null {
  if (!hash || typeof hash !== 'string') return null;
  const cleanHash = hash.replace(/^#/, '');
  const params = new URLSearchParams(cleanHash);
  const rawEncoded = params.get('d');
  if (!rawEncoded) return null;

  try {
    const base64 = rawEncoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const utf8Bytes =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('utf-8');
    const json = decodeURIComponent(utf8Bytes);
    const parsed = JSON.parse(json) as Partial<BirthdayConfig>;
    if (parsed && typeof parsed === 'object' && typeof parsed.recipientName === 'string') {
      return parsed;
    }
  } catch {
    // Ignore malformed hash
  }
  return null;
}

/**
 * Builds a compact, Nginx-safe short-ID share URL (e.g., https://example.com/?s=dora7x9k).
 * Automatically converts private AI Studio dev preview origins (https://ais-dev-...)
 * to the publicly accessible Shared App origin (https://ais-pre-...) so shared links
 * open in any browser tab without iframe authentication errors.
 * When `configForHash` is provided, appends `#d=<encodedPayload>` in the URL fragment
 * (which is never sent to HTTP servers/Nginx, avoiding 414 errors while ensuring
 * cross-device / Vercel stateless link reliability).
 */
export function buildCompactShareUrl(
  origin: string,
  pathname: string,
  shortId: string,
  configForHash?: BirthdayConfig
): string {
  const publicOrigin = (origin || '')
    .replace(/\/+$/, '')
    .replace(/^https:\/\/ais-dev-/, 'https://ais-pre-');
  const cleanPath = pathname && pathname.startsWith('/') ? pathname : '/';
  const safeId = (shortId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
  if (!safeId) {
    return `${publicOrigin}${cleanPath}`;
  }
  const base = `${publicOrigin}${cleanPath}?s=${encodeURIComponent(safeId)}`;
  if (configForHash) {
    const hashData = encodeShareHashPayload(configForHash);
    if (hashData) {
      return `${base}#d=${hashData}`;
    }
  }
  return base;
}

/**
 * Extracts a short share ID (?s=... or ?id=...) from a URL search string.
 */
export function extractShareIdFromSearch(search: string): string | null {
  if (!search || typeof search !== 'string') return null;
  const params = new URLSearchParams(search);
  const raw = (params.get('s') || params.get('id') || '').trim();
  if (/^[a-zA-Z0-9_-]{3,32}$/.test(raw)) {
    return raw;
  }
  return null;
}

/**
 * Normalizes a partial or retrieved BirthdayConfig with safe defaults for all nested fields,
 * and normalizes /api/uploads/ paths to static /uploads/ paths so images load on both
 * Express and static SPA hosts.
 */
export function normalizeBirthdayConfig(
  parsed: Partial<BirthdayConfig> | null | undefined
): BirthdayConfig {
  if (!parsed || typeof parsed !== 'object') {
    return DEFAULT_BIRTHDAY_CONFIG;
  }
  const rawMemories = Array.isArray(parsed.memories)
    ? parsed.memories
    : DEFAULT_BIRTHDAY_CONFIG.memories;

  const normalizedMemories = rawMemories.map((m) => ({
    ...m,
    imageUrl:
      typeof m.imageUrl === 'string' && m.imageUrl.startsWith('/api/uploads/')
        ? m.imageUrl.replace(/^\/api\/uploads\//, '/uploads/')
        : m.imageUrl,
  }));

  const rawMusic = {
    ...DEFAULT_BIRTHDAY_CONFIG.music,
    ...(parsed.music || {}),
  };
  if (
    typeof rawMusic.customAudioDataUrl === 'string' &&
    rawMusic.customAudioDataUrl.startsWith('/api/uploads/')
  ) {
    rawMusic.customAudioDataUrl = rawMusic.customAudioDataUrl.replace(
      /^\/api\/uploads\//,
      '/uploads/'
    );
  }

  return getPersonalizedViewConfig({
    ...DEFAULT_BIRTHDAY_CONFIG,
    ...parsed,
    memories: normalizedMemories,
    wishes: Array.isArray(parsed.wishes)
      ? parsed.wishes
      : DEFAULT_BIRTHDAY_CONFIG.wishes,
    funnyMoments: Array.isArray(parsed.funnyMoments)
      ? parsed.funnyMoments
      : DEFAULT_BIRTHDAY_CONFIG.funnyMoments,
    gadgetSurprises: Array.isArray(parsed.gadgetSurprises)
      ? parsed.gadgetSurprises
      : DEFAULT_BIRTHDAY_CONFIG.gadgetSurprises,
    sections: {
      ...DEFAULT_BIRTHDAY_CONFIG.sections,
      ...(parsed.sections || {}),
    },
    appearance: {
      ...DEFAULT_BIRTHDAY_CONFIG.appearance,
      ...(parsed.appearance || {}),
    },
    music: rawMusic,
  });
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generates a complete, self-contained HTML file containing the personalized
 * Doraemon-inspired birthday experience so it can also be shared offline as a standalone file.
 */
export function generateStandaloneBirthdayHtml(config: BirthdayConfig): string {
  const safeName = escapeHtml(config.recipientName || 'Friend');
  const safeHeadline = escapeHtml(
    config.headline || `Happy Birthday, ${config.recipientName}! 🎂`
  );
  const safeSender = escapeHtml(config.senderName || 'Your Friends');
  const safeRel = escapeHtml(config.relationship || 'Special Friend');
  const safeMessage = escapeHtml(config.personalMessage);
  const safeLetterGreeting = escapeHtml(config.letterGreeting);
  const safeLetterBody = escapeHtml(config.letterBody);
  const safeLetterSignOff = escapeHtml(config.letterSignOff);
  const safeFinalHeadline = escapeHtml(config.finalHeadline);
  const safeFinalSubtext = escapeHtml(config.finalSubtext);
  const ordinalAge = escapeHtml(formatOrdinalAge(config.age));

  const memoriesHtml = config.memories
    .map(
      (m) => `
      <div class="card memory-card">
        <img src="${escapeHtml(m.imageUrl)}" alt="${escapeHtml(m.caption)}" class="memory-img" />
        <div class="memory-body">
          <span class="tag">${escapeHtml(m.dateLabel)}</span>
          <h4>${escapeHtml(m.caption)}</h4>
          <p>${escapeHtml(m.story)}</p>
        </div>
      </div>`
    )
    .join('\n');

  const gadgetsHtml = config.gadgetSurprises
    .map(
      (g) => `
      <div class="card gadget-card">
        <span class="tag">🔓 ${escapeHtml(g.gadgetName)}</span>
        <h4>${escapeHtml(g.surpriseTitle)}</h4>
        <p>${escapeHtml(g.surpriseMessage)}</p>
        <p class="hint">✨ ${escapeHtml(g.unlockedHint)}</p>
      </div>`
    )
    .join('\n');

  const wishesHtml = config.wishes
    .map(
      (w) => `
      <div class="card wish-card">
        <div class="wish-header">
          <strong>${escapeHtml(w.senderName)}</strong>
          <span class="tag">${escapeHtml(w.roleLabel)}</span>
        </div>
        <p>“${escapeHtml(w.message)}”</p>
      </div>`
    )
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeHeadline} — DoraPocket Birthday Surprise</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(180deg, #EAF7FF 0%, #FFFFFF 100%);
      color: #183247;
      line-height: 1.6;
      padding: 24px 16px 64px;
    }
    .container {
      max-width: 920px;
      margin: 0 auto;
      background: #FFFFFF;
      border: 3px solid #64C8FF;
      border-radius: 28px;
      box-shadow: 0 18px 48px rgba(22, 141, 206, 0.14);
      overflow: hidden;
    }
    .hero {
      background: linear-gradient(135deg, #168DCE 0%, #64C8FF 100%);
      color: #FFFFFF;
      padding: 40px 28px;
      text-align: center;
      border-bottom: 4px solid #F04444;
      position: relative;
    }
    .bell-badge {
      display: inline-block;
      background: #FFD84D;
      color: #183247;
      font-weight: 800;
      padding: 6px 16px;
      border-radius: 999px;
      font-size: 13px;
      margin-bottom: 14px;
      border: 2px solid #183247;
    }
    h1 { font-size: 32px; margin-bottom: 8px; }
    .subtitle { font-size: 15px; opacity: 0.95; }
    .section { padding: 32px 28px; border-bottom: 1px solid #EAF7FF; }
    .section h2 { font-size: 22px; color: #168DCE; margin-bottom: 16px; }
    .lead-box {
      background: #EAF7FF;
      border: 2px solid #64C8FF;
      border-radius: 20px;
      padding: 22px;
      font-size: 16px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 18px;
    }
    .card {
      background: #EAF7FF;
      border: 1.5px solid #64C8FF;
      border-radius: 20px;
      overflow: hidden;
      padding: 18px;
    }
    .memory-card { padding: 0; }
    .memory-img { width: 100%; height: 200px; object-fit: cover; display: block; }
    .memory-body { padding: 16px; }
    .tag {
      display: inline-block;
      background: #FFFFFF;
      color: #168DCE;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 999px;
      margin-bottom: 8px;
    }
    h4 { font-size: 16px; margin-bottom: 6px; color: #183247; }
    .hint { margin-top: 8px; font-size: 12px; font-weight: 700; color: #168DCE; }
    .letter {
      background: #FFFDF5;
      border: 2px dashed #FFD84D;
      border-radius: 20px;
      padding: 24px;
      white-space: pre-line;
    }
    .finale {
      text-align: center;
      padding: 40px 28px;
      background: #EAF7FF;
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="hero">
      <div class="bell-badge">🔔 Celebrating ${safeName}'s ${ordinalAge} Birthday</div>
      <h1>${safeHeadline}</h1>
      <p class="subtitle">From ${safeSender} · ${safeRel}</p>
    </header>
    <section class="section">
      <h2>💙 Personal Birthday Note</h2>
      <div class="lead-box">${safeMessage}</div>
    </section>
    <section class="section">
      <h2>📸 Favorite Memories &amp; Snapshots</h2>
      <div class="grid">${memoriesHtml}</div>
    </section>
    <section class="section">
      <h2>🎁 4D Pocket Gadget Surprises</h2>
      <div class="grid">${gadgetsHtml}</div>
    </section>
    <section class="section">
      <h2>💌 Heartfelt Birthday Letter</h2>
      <div class="letter">
        <strong>${safeLetterGreeting}</strong>\n\n${safeLetterBody}\n\n<em>${safeLetterSignOff}</em>
      </div>
    </section>
    <section class="section">
      <h2>🌟 Birthday Wishes from Friends</h2>
      <div class="grid">${wishesHtml}</div>
    </section>
    <footer class="finale">
      <h2>${safeFinalHeadline}</h2>
      <p>${safeFinalSubtext}</p>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Applies a curated Doraemon-inspired character preset while keeping existing photos intact.
 */
export function applyCharacterPreset(
  presetKey: 'nobita' | 'shizuka' | 'dorami' | 'best-friend',
  current: BirthdayConfig
): BirthdayConfig {
  switch (presetKey) {
    case 'shizuka':
      return {
        ...current,
        recipientName: 'Shizuka',
        nickname: 'Shizuka-chan',
        age: 21,
        senderName: 'Nobita & Doraemon',
        relationship: 'Dearest Friend',
        headline: 'Happy Birthday, Shizuka! 🎂✨',
        personalMessage:
          'May your birthday be filled with warm melodies, sweet strawberry shortcake, and sky-high adventures across the clouds!',
        letterGreeting: 'Dear Shizuka,',
        letterBody:
          'Thank you for always bringing warmth, patience, and sunshine wherever you go. Whether we are studying together or flying across the evening sky with Bamboo Copters, every memory with you is our favorite chapter.',
        letterSignOff: 'Always cheering for you, Nobita & Doraemon 💙🎻',
        appearance: {
          ...current.appearance,
          layout: 'anywhere-storybook',
          accent: 'collar-red',
        },
      };
    case 'dorami':
      return {
        ...current,
        recipientName: 'Dorami',
        nickname: 'Dorami-chan',
        age: 18,
        senderName: 'Doraemon & Sewashi',
        relationship: '22nd-Century Family',
        headline: 'Happy Birthday, Dorami! 🎀💛',
        personalMessage:
          'Sending a giant basket of freshly baked melon bread and golden stars to the most organized, big-hearted sister in the 22nd century!',
        letterGreeting: 'Dear Dorami,',
        letterBody:
          'Whenever things get chaotic, your bright yellow ribbon and cheerful smile save the day. Today it is your turn to relax, enjoy fresh melon bread, and celebrate among the stars!',
        letterSignOff: 'With love from the 22nd Century, Doraemon 🔔💛',
        appearance: {
          ...current.appearance,
          layout: 'starlight-cloud',
          accent: 'bell-gold',
        },
      };
    case 'best-friend':
      return {
        ...current,
        recipientName: 'Alex',
        nickname: 'Captain Alex',
        age: 24,
        senderName: 'Your Partner-in-Crime',
        relationship: 'Best Friend Since Day One',
        headline: 'Happy Birthday, Alex! 🎂',
        personalMessage:
          'If I had a real 4D Pocket, I would pull out an Anywhere Door just so we could hang out whenever we want. Wishing you the happiest birthday!',
        letterGreeting: 'Hey Alex,',
        letterBody:
          'Another year older, wiser, and still the best person to go on spontaneous food runs and late-night talks with. Thank you for always having my back through every plot twist.',
        letterSignOff: 'Your forever co-pilot in adventure 🚀💙',
        appearance: {
          ...current.appearance,
          layout: 'classic-pocket',
          accent: 'dora-blue',
        },
      };
    case 'nobita':
    default:
      return {
        ...DEFAULT_BIRTHDAY_CONFIG,
        memories: current.memories.length > 0 ? current.memories : DEFAULT_MEMORIES,
        music: current.music || DEFAULT_BIRTHDAY_CONFIG.music,
      };
  }
}

export type PhotoAspectRatio = '16:9' | '4:3' | '1:1' | '3:4';

/**
 * Returns target canvas output dimensions (width, height) for a selected crop aspect ratio.
 */
export function getAspectRatioDimensions(ratio: PhotoAspectRatio): {
  width: number;
  height: number;
} {
  switch (ratio) {
    case '4:3':
      return { width: 800, height: 600 };
    case '1:1':
      return { width: 720, height: 720 };
    case '3:4':
      return { width: 600, height: 800 };
    case '16:9':
    default:
      return { width: 800, height: 450 };
  }
}

/**
 * Builds a CSS/Canvas filter string from brightness, contrast, saturation, and warmth values.
 */
export function buildCanvasFilterString(settings: {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth?: number;
}): string {
  const b = Math.max(40, Math.min(200, Math.round(settings.brightness || 100)));
  const c = Math.max(40, Math.min(200, Math.round(settings.contrast || 100)));
  const s = Math.max(0, Math.min(250, Math.round(settings.saturation ?? 100)));
  const sepia =
    settings.warmth && settings.warmth > 0
      ? Math.min(40, Math.round(settings.warmth))
      : 0;
  return `brightness(${b}%) contrast(${c}%) saturate(${s}%) sepia(${sepia}%)`;
}

