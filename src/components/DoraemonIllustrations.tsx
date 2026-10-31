import React from 'react';
import { CharacterKey, GadgetKey } from '../types/birthday';

/**
 * Iconic Golden Bell & Red Collar Motif
 */
export const DoraBellBadge: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Red Collar Band */}
    <rect x="4" y="8" width="40" height="9" rx="4.5" fill="#F04444" stroke="#183247" strokeWidth="2.5" />
    {/* Golden Bell Sphere */}
    <circle cx="24" cy="27" r="14" fill="#FFD84D" stroke="#183247" strokeWidth="2.5" />
    {/* Bell highlight */}
    <path d="M16 21C17.5 18.5 20.5 17 24 17" stroke="#FFF9D6" strokeWidth="2.5" strokeLinecap="round" />
    {/* Bell horizontal ridge */}
    <rect x="10" y="23" width="28" height="4" rx="2" fill="#F4B400" stroke="#183247" strokeWidth="2" />
    {/* Bell center hole & slit */}
    <circle cx="24" cy="32" r="3" fill="#183247" />
    <line x1="24" y1="35" x2="24" y2="41" stroke="#183247" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/**
 * Hero Illustration for the Landing Page featuring Doraemon-inspired character silhouette,
 * 4D Pocket, spinning Bamboo Copter, Pink Anywhere Door, Dorayaki, and Floating Sky Clouds.
 */
export const DoraemonHeroArtwork: React.FC<{
  recipientName?: string;
  onDoorClick?: () => void;
}> = ({ recipientName = 'Birthday Star', onDoorClick }) => {
  return (
    <div className="relative w-full max-w-[540px] mx-auto select-none">
      <svg
        viewBox="0 0 560 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_20px_40px_rgba(22,141,206,0.16)]"
        role="img"
        aria-label="Doraemon-inspired birthday illustration with Anywhere Door, Bamboo Copter, and 4D Pocket"
      >
        <defs>
          <linearGradient id="heroSkyCircle" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#EAF7FF" />
            <stop offset="100%" stopColor="#BCE6FF" />
          </linearGradient>
          <linearGradient id="doraBlueBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64C8FF" />
            <stop offset="100%" stopColor="#168DCE" />
          </linearGradient>
          <linearGradient id="anywhereDoorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF85B3" />
            <stop offset="100%" stopColor="#F0447C" />
          </linearGradient>
        </defs>

        {/* Main Soft Sky Portal Backdrop */}
        <circle cx="285" cy="235" r="195" fill="url(#heroSkyCircle)" stroke="#FFFFFF" strokeWidth="8" />
        <circle cx="285" cy="235" r="165" stroke="#64C8FF" strokeWidth="2" strokeDasharray="6 8" opacity="0.6" />

        {/* Back Fluffy Clouds */}
        <g className="animate-float-drift" fill="#FFFFFF">
          <path
            d="M65 160C65 142 80 128 98 128C106 112 124 102 144 105C162 108 175 122 177 139C190 141 200 152 200 165C200 180 188 192 173 192H92C77 192 65 180 65 160Z"
            stroke="#BCE6FF"
            strokeWidth="2.5"
          />
          <path
            d="M375 115C375 100 388 88 403 88C410 74 426 66 442 69C458 71 469 83 471 98C482 99 490 108 490 119C490 132 480 142 467 142H398C385 142 375 132 375 115Z"
            stroke="#BCE6FF"
            strokeWidth="2.5"
          />
        </g>

        {/* Pink Anywhere Door (Left Side of Portal, Interactive on click) */}
        <g
          transform="translate(82, 128)"
          onClick={onDoorClick}
          className={onDoorClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''}
        >
          {/* Door Outer Frame */}
          <rect x="0" y="0" width="136" height="234" rx="14" fill="url(#anywhereDoorGrad)" stroke="#183247" strokeWidth="4" />
          <rect x="12" y="12" width="112" height="210" rx="8" fill="#FFA4C8" stroke="#183247" strokeWidth="3" />
          {/* Inner Sky Portal Peek */}
          <rect x="22" y="24" width="92" height="84" rx="6" fill="#EAF7FF" stroke="#183247" strokeWidth="2.5" />
          <text x="68" y="60" textAnchor="middle" fill="#168DCE" fontSize="12" fontWeight="700" fontFamily="Fredoka, sans-serif">
            {recipientName.slice(0, 12)}&apos;s
          </text>
          <text x="68" y="78" textAnchor="middle" fill="#183247" fontSize="11" fontWeight="600" fontFamily="DM Sans, sans-serif">
            Birthday Door 🚪
          </text>
          <rect x="22" y="122" width="92" height="82" rx="6" fill="#FFD1E4" stroke="#183247" strokeWidth="2.5" />
          {/* Golden Door Knob */}
          <circle cx="102" cy="115" r="8" fill="#FFD84D" stroke="#183247" strokeWidth="3" />
        </g>

        {/* Doraemon-Inspired Robotic Cat Character Figure (Right-Center of Portal) */}
        <g transform="translate(240, 88)">
          <g className="animate-float-slow">
            {/* Bamboo Copter (Take-copter) on Top */}
            <g transform="translate(105, 0)">
              <rect x="-3" y="10" width="6" height="24" fill="#FFD84D" stroke="#183247" strokeWidth="2.5" />
              <circle cx="0" cy="10" r="6" fill="#FFD84D" stroke="#183247" strokeWidth="2.5" />
              <ellipse
                cx="0"
                cy="6"
                rx="42"
                ry="5"
                fill="#FFD84D"
                stroke="#183247"
                strokeWidth="2.5"
                className="origin-center animate-copter"
              />
            </g>

            {/* Torso & Arms */}
            <rect x="42" y="158" width="126" height="112" rx="48" fill="url(#doraBlueBody)" stroke="#183247" strokeWidth="4" />
            {/* Left waving arm */}
            <g transform="rotate(-20 46 184)">
              <rect x="4" y="168" width="52" height="32" rx="16" fill="#64C8FF" stroke="#183247" strokeWidth="4" />
              <circle cx="8" cy="184" r="16" fill="#FFFFFF" stroke="#183247" strokeWidth="4" />
            </g>
            {/* Right arm waving */}
            <g transform="rotate(18 164 184)">
              <rect x="154" y="168" width="52" height="32" rx="16" fill="#64C8FF" stroke="#183247" strokeWidth="4" />
              <circle cx="204" cy="184" r="16" fill="#FFFFFF" stroke="#183247" strokeWidth="4" />
            </g>

            {/* White Belly & 4D Pocket (Yojigen Pocket) */}
            <circle cx="105" cy="214" r="46" fill="#FFFFFF" stroke="#183247" strokeWidth="3.5" />
            <path
              d="M72 208 H138 C138 229 123 245 105 245 C87 245 72 229 72 208 Z"
              fill="#EAF7FF"
              stroke="#183247"
              strokeWidth="3.5"
            />

            {/* Feet */}
            <ellipse cx="75" cy="272" rx="30" ry="15" fill="#FFFFFF" stroke="#183247" strokeWidth="4" />
            <ellipse cx="135" cy="272" rx="30" ry="15" fill="#FFFFFF" stroke="#183247" strokeWidth="4" />

            {/* Iconic Blue Head Dome */}
            <circle cx="105" cy="104" r="74" fill="url(#doraBlueBody)" stroke="#183247" strokeWidth="4" />
            {/* White Inner Face */}
            <ellipse cx="105" cy="116" rx="60" ry="54" fill="#FFFFFF" stroke="#183247" strokeWidth="3.5" />

            {/* Expressive Eyes */}
            <ellipse cx="88" cy="68" rx="16" ry="20" fill="#FFFFFF" stroke="#183247" strokeWidth="3.5" />
            <ellipse cx="122" cy="68" rx="16" ry="20" fill="#FFFFFF" stroke="#183247" strokeWidth="3.5" />
            {/* Happy pupils */}
            <circle cx="92" cy="70" r="5.5" fill="#183247" />
            <circle cx="90" cy="68" r="2" fill="#FFFFFF" />
            <circle cx="118" cy="70" r="5.5" fill="#183247" />
            <circle cx="116" cy="68" r="2" fill="#FFFFFF" />

            {/* Cherry Red Nose */}
            <circle cx="105" cy="88" r="11" fill="#F04444" stroke="#183247" strokeWidth="3.5" />
            <circle cx="101" cy="84" r="3.5" fill="#FFFFFF" />

            {/* Philtrum & Big Joyful Smile */}
            <line x1="105" y1="99" x2="105" y2="128" stroke="#183247" strokeWidth="3.5" strokeLinecap="round" />
            <path
              d="M72 122 C82 146, 128 146, 138 122"
              stroke="#183247"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />

            {/* Six Whiskers */}
            <g stroke="#183247" strokeWidth="3" strokeLinecap="round">
              <line x1="52" y1="95" x2="78" y2="102" />
              <line x1="48" y1="110" x2="76" y2="110" />
              <line x1="52" y1="125" x2="78" y2="118" />
              <line x1="158" y1="95" x2="132" y2="102" />
              <line x1="162" y1="110" x2="134" y2="110" />
              <line x1="158" y1="125" x2="132" y2="118" />
            </g>

            {/* Red Collar & Golden Bell */}
            <rect x="48" y="160" width="114" height="16" rx="8" fill="#F04444" stroke="#183247" strokeWidth="3.5" />
            <circle cx="105" cy="174" r="15" fill="#FFD84D" stroke="#183247" strokeWidth="3.5" />
            <line x1="91" y1="171" x2="119" y2="171" stroke="#183247" strokeWidth="2.5" />
            <circle cx="105" cy="178" r="3.5" fill="#183247" />
          </g>
        </g>

        {/* Floating Dorayaki Sweet Badge on Right */}
        <g transform="translate(442, 162)">
          <g className="animate-float-drift">
            <circle cx="34" cy="34" r="28" fill="#FFD84D" stroke="#183247" strokeWidth="3.5" />
            <ellipse cx="34" cy="34" rx="20" ry="11" fill="#C87528" stroke="#183247" strokeWidth="2.5" />
            <ellipse cx="34" cy="31" rx="18" ry="9" fill="#E3923B" />
          </g>
        </g>

        {/* Twinkling Stars */}
        <g className="animate-twinkle" fill="#FFD84D" stroke="#183247" strokeWidth="2">
          <path d="M92 78 L97 91 L110 96 L97 101 L92 114 L87 101 L74 96 L87 91 Z" />
          <path d="M472 288 L476 298 L486 302 L476 306 L472 316 L468 306 L458 302 L468 298 Z" />
          <circle cx="215" cy="68" r="6" />
          <circle cx="485" cy="138" r="7" />
        </g>

        {/* Foreground Cloud Cushion */}
        <path
          d="M55 392C55 370 74 354 96 354C108 334 132 324 156 330C174 312 204 310 225 326C246 312 278 315 295 335C316 324 345 330 358 350C378 342 402 350 412 368C432 365 452 378 452 396C452 414 436 426 416 426H92C70 426 55 412 55 392Z"
          fill="#FFFFFF"
          stroke="#64C8FF"
          strokeWidth="3.5"
        />
      </svg>
    </div>
  );
};

/**
 * Interactive Anywhere Door for Step 1 of the Birthday Experience
 */
export const AnywhereDoorInteractive: React.FC<{
  isOpen: boolean;
  onToggleOpen: () => void;
  recipientName: string;
}> = ({ isOpen, onToggleOpen, recipientName }) => {
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onToggleOpen}
        aria-label={isOpen ? 'Close the Anywhere Door' : 'Open the Anywhere Door'}
        className="group relative focus:outline-none focus-visible:ring-4 focus-visible:ring-[#168DCE]/40 rounded-3xl p-1.5 transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
      >
        <svg
          width="196"
          height="232"
          viewBox="0 0 240 290"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_14px_28px_rgba(24,50,71,0.14)]"
        >
          {/* Cloud Base */}
          <ellipse cx="120" cy="276" rx="105" ry="18" fill="#EAF7FF" stroke="#64C8FF" strokeWidth="2.5" />

          {/* Outer Pink Frame */}
          <rect x="36" y="16" width="168" height="256" rx="14" fill="#FF7EB3" stroke="#183247" strokeWidth="4" />
          <rect x="48" y="28" width="144" height="236" rx="8" fill="#EAF7FF" stroke="#183247" strokeWidth="3" />

          {/* Magical Sky Inside the Open Door */}
          <g>
            <rect x="50" y="30" width="140" height="232" rx="6" fill="#64C8FF" />
            <circle cx="120" cy="115" r="44" fill="#FFF9D6" opacity="0.9" />
            <circle cx="120" cy="115" r="32" fill="#FFD84D" />
            <path d="M50 210 Q95 180 140 205 T190 198 L190 262 L50 262 Z" fill="#FFFFFF" />
            <text
              x="120"
              y="168"
              textAnchor="middle"
              fill="#183247"
              fontSize="14"
              fontWeight="700"
              fontFamily="Fredoka, sans-serif"
            >
              Welcome, {recipientName}!
            </text>
            <text
              x="120"
              y="188"
              textAnchor="middle"
              fill="#168DCE"
              fontSize="11"
              fontWeight="600"
              fontFamily="DM Sans, sans-serif"
            >
              🎂 Step Inside 🎂
            </text>
          </g>

          {/* Swinging Door Leaf */}
          <g
            style={{
              transform: isOpen ? 'scaleX(0.18)' : 'scaleX(1)',
              transformOrigin: '48px 146px',
              transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <rect x="48" y="28" width="144" height="236" rx="8" fill="#FFA4C8" stroke="#183247" strokeWidth="3" />
            <rect x="64" y="46" width="112" height="92" rx="6" fill="#FFD1E4" stroke="#183247" strokeWidth="2.5" />
            <rect x="64" y="154" width="112" height="92" rx="6" fill="#FFD1E4" stroke="#183247" strokeWidth="2.5" />
            <circle cx="168" cy="146" r="9" fill="#FFD84D" stroke="#183247" strokeWidth="3" />
          </g>
        </svg>
      </button>
      <span className="mt-2 text-xs font-medium text-[#168DCE]">
        {isOpen
          ? '✨ The Anywhere Door is open! Click Next Step below to enter.'
          : '🚪 Click the Anywhere Door to unlock your birthday world'}
      </span>
    </div>
  );
};

/**
 * Custom Vector Gadget Icons for 4D Pocket Surprises
 */
export const GadgetIllustration: React.FC<{ gadget: GadgetKey; className?: string }> = ({
  gadget,
  className = 'w-12 h-12',
}) => {
  switch (gadget) {
    case 'anywhere-door':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <rect x="14" y="6" width="36" height="52" rx="6" fill="#FF7EB3" stroke="#183247" strokeWidth="3" />
          <rect x="20" y="12" width="24" height="20" rx="3" fill="#EAF7FF" stroke="#183247" strokeWidth="2.5" />
          <rect x="20" y="36" width="24" height="16" rx="3" fill="#FFD1E4" stroke="#183247" strokeWidth="2.5" />
          <circle cx="40" cy="34" r="3.5" fill="#FFD84D" stroke="#183247" strokeWidth="2" />
        </svg>
      );
    case 'bamboo-copter':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <ellipse cx="32" cy="16" rx="24" ry="5" fill="#FFD84D" stroke="#183247" strokeWidth="3" />
          <rect x="29" y="18" width="6" height="22" fill="#FFD84D" stroke="#183247" strokeWidth="3" />
          <path d="M18 46 C18 38 46 38 46 46 Z" fill="#FFD84D" stroke="#183247" strokeWidth="3" />
        </svg>
      );
    case 'memory-bread':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path
            d="M14 26 C14 14 50 14 50 26 L48 52 C48 55 45 56 42 56 H22 C19 56 16 55 16 52 Z"
            fill="#FFF7DF"
            stroke="#C87528"
            strokeWidth="4"
          />
          <line x1="22" y1="28" x2="42" y2="28" stroke="#183247" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="22" y1="36" x2="38" y2="36" stroke="#183247" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="22" y1="44" x2="42" y2="44" stroke="#183247" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'time-kerchief':
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <path d="M10 18 L54 14 L50 52 L14 48 Z" fill="#F04444" stroke="#183247" strokeWidth="3" />
          <circle cx="26" cy="28" r="7" fill="#FFFFFF" stroke="#183247" strokeWidth="2.5" />
          <polyline points="26,24 26,28 29,30" stroke="#183247" strokeWidth="2" strokeLinecap="round" />
          <circle cx="40" cy="38" r="7" fill="#EAF7FF" stroke="#183247" strokeWidth="2.5" />
          <polyline points="40,34 40,38 37,40" stroke="#183247" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'dress-up-camera':
    case 'big-light':
    default:
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
          <rect x="10" y="18" width="44" height="32" rx="8" fill="#64C8FF" stroke="#183247" strokeWidth="3" />
          <circle cx="32" cy="34" r="10" fill="#FFD84D" stroke="#183247" strokeWidth="3" />
          <rect x="22" y="12" width="20" height="6" rx="3" fill="#F04444" stroke="#183247" strokeWidth="2.5" />
        </svg>
      );
  }
};

/**
 * Character Avatar Badges for Wishes (Doraemon, Nobita, Shizuka, Gian, Suneo, Dorami)
 */
export const CharacterAvatar: React.FC<{ character: CharacterKey; className?: string }> = ({
  character,
  className = 'w-11 h-11',
}) => {
  switch (character) {
    case 'nobita':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <circle cx="24" cy="24" r="22" fill="#FFF7D6" stroke="#183247" strokeWidth="2.5" />
          <path d="M10 18 C12 9 36 9 38 18 Z" fill="#183247" />
          <circle cx="18" cy="24" r="6" fill="#FFFFFF" stroke="#183247" strokeWidth="2.5" />
          <circle cx="30" cy="24" r="6" fill="#FFFFFF" stroke="#183247" strokeWidth="2.5" />
          <line x1="24" y1="24" x2="24" y2="24" stroke="#183247" strokeWidth="2.5" />
          <path d="M19 34 Q24 38 29 34" stroke="#183247" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'shizuka':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <circle cx="24" cy="24" r="22" fill="#FFE8F2" stroke="#183247" strokeWidth="2.5" />
          <path d="M12 19 C14 10 34 10 36 19 Z" fill="#3B2314" />
          <circle cx="18" cy="24" r="2.5" fill="#183247" />
          <circle cx="30" cy="24" r="2.5" fill="#183247" />
          <path d="M19 32 Q24 36 29 32" stroke="#F04444" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'gian':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <circle cx="24" cy="24" r="22" fill="#FFE6C2" stroke="#183247" strokeWidth="2.5" />
          <path d="M10 38 L18 32 L24 38 L30 32 L38 38" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
          <circle cx="18" cy="22" r="3" fill="#183247" />
          <circle cx="30" cy="22" r="3" fill="#183247" />
          <path d="M17 29 Q24 33 31 29" stroke="#183247" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'suneo':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <circle cx="24" cy="24" r="22" fill="#DFF5FF" stroke="#183247" strokeWidth="2.5" />
          <path d="M14 16 L22 11 L20 17 L29 12 L27 18 L34 16" stroke="#183247" strokeWidth="3" strokeLinecap="round" />
          <circle cx="18" cy="25" r="2.5" fill="#183247" />
          <circle cx="30" cy="25" r="2.5" fill="#183247" />
          <path d="M18 33 Q24 36 30 33" stroke="#183247" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'dorami':
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <circle cx="24" cy="26" r="19" fill="#FFD84D" stroke="#183247" strokeWidth="2.5" />
          {/* Red bow ears */}
          <path d="M14 10 L20 16 L12 18 Z" fill="#F04444" stroke="#183247" strokeWidth="2" />
          <path d="M34 10 L28 16 L36 18 Z" fill="#F04444" stroke="#183247" strokeWidth="2" />
          <ellipse cx="24" cy="28" rx="14" ry="12" fill="#FFFFFF" stroke="#183247" strokeWidth="2" />
          <circle cx="24" cy="24" r="3" fill="#F04444" />
          <path d="M18 31 Q24 35 30 31" stroke="#183247" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'doraemon':
    default:
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
          <circle cx="24" cy="24" r="21" fill="#64C8FF" stroke="#183247" strokeWidth="2.5" />
          <ellipse cx="24" cy="27" rx="16" ry="14" fill="#FFFFFF" stroke="#183247" strokeWidth="2" />
          <circle cx="24" cy="21" r="3.5" fill="#F04444" stroke="#183247" strokeWidth="1.5" />
          <path d="M17 29 Q24 35 31 29" stroke="#183247" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
  }
};

/**
 * Subtle Animated Floating Clouds & Stars Background Layer
 */
export const FloatingSkyBackdrop: React.FC<{ enabled?: boolean }> = ({ enabled = true }) => {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Top-left cloud */}
      <svg
        viewBox="0 0 220 100"
        className={`absolute top-12 left-[4%] w-44 h-auto opacity-75 ${
          enabled ? 'animate-float-drift' : ''
        }`}
        fill="none"
      >
        <path
          d="M25 75C12 75 2 65 2 52C2 40 11 30 23 29C29 13 45 2 64 2C86 2 104 17 108 38C113 35 119 34 125 34C144 34 159 49 159 68C159 72 158 75 157 75H25Z"
          fill="#FFFFFF"
        />
      </svg>
      {/* Top-right cloud */}
      <svg
        viewBox="0 0 220 100"
        className={`absolute top-20 right-[5%] w-52 h-auto opacity-70 ${
          enabled ? 'animate-float-slow' : ''
        }`}
        fill="none"
      >
        <path
          d="M25 75C12 75 2 65 2 52C2 40 11 30 23 29C29 13 45 2 64 2C86 2 104 17 108 38C113 35 119 34 125 34C144 34 159 49 159 68C159 72 158 75 157 75H25Z"
          fill="#FFFFFF"
        />
      </svg>
      {/* Bottom-left cloud */}
      <svg
        viewBox="0 0 220 100"
        className={`absolute bottom-10 left-[8%] w-48 h-auto opacity-65 ${
          enabled ? 'animate-float-slow' : ''
        }`}
        fill="none"
      >
        <path
          d="M25 75C12 75 2 65 2 52C2 40 11 30 23 29C29 13 45 2 64 2C86 2 104 17 108 38C113 35 119 34 125 34C144 34 159 49 159 68C159 72 158 75 157 75H25Z"
          fill="#FFFFFF"
        />
      </svg>
      {/* Subtle twinkling golden stars */}
      <svg
        viewBox="0 0 32 32"
        className={`absolute top-28 left-[28%] w-5 h-5 text-[#FFD84D] ${
          enabled ? 'animate-twinkle' : ''
        }`}
        fill="currentColor"
      >
        <path d="M16 2L19.5 12.5L30 16L19.5 19.5L16 30L12.5 19.5L2 16L12.5 12.5L16 2Z" />
      </svg>
      <svg
        viewBox="0 0 32 32"
        className={`absolute top-40 right-[24%] w-4 h-4 text-[#FFD84D] ${
          enabled ? 'animate-twinkle' : ''
        }`}
        fill="currentColor"
      >
        <path d="M16 2L19.5 12.5L30 16L19.5 19.5L16 30L12.5 19.5L2 16L12.5 12.5L16 2Z" />
      </svg>
    </div>
  );
};
