import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_BIRTHDAY_CONFIG,
  applyCharacterPreset,
  buildCanvasFilterString,
  buildCompactShareUrl,
  extractShareIdFromSearch,
  extractYouTubeVideoId,
  formatOrdinalAge,
  generateStandaloneBirthdayHtml,
  getActiveExperienceSteps,
  getAspectRatioDimensions,
  moveItemInArray,
  normalizeBirthdayConfig,
  validateBirthdayDetails,
} from './birthdayLogic';

test('getActiveExperienceSteps returns all 6 steps when all sections are visible', () => {
  const steps = getActiveExperienceSteps(DEFAULT_BIRTHDAY_CONFIG.sections);
  assert.equal(steps.length, 6);
  assert.deepEqual(
    steps.map((s) => s.id),
    ['welcome', 'milestone', 'memories', 'surprises', 'letter', 'finale']
  );
  assert.equal(steps[0].index, 1);
  assert.equal(steps[5].index, 6);
});

test('getActiveExperienceSteps hides disabled optional sections and re-indexes steps', () => {
  const steps = getActiveExperienceSteps({
    showMemoriesGallery: false,
    showGadgetSurprises: false,
    showFunnyMoments: false,
    showHeartfeltLetter: true,
    showFriendsWishes: false,
  });
  assert.equal(steps.length, 4);
  assert.deepEqual(
    steps.map((s) => s.id),
    ['welcome', 'milestone', 'letter', 'finale']
  );
  assert.deepEqual(
    steps.map((s) => s.index),
    [1, 2, 3, 4]
  );
});

test('moveItemInArray reorders elements safely without mutating original array', () => {
  const original = ['a', 'b', 'c', 'd'];
  const moved = moveItemInArray(original, 1, 3);
  assert.deepEqual(moved, ['a', 'c', 'd', 'b']);
  assert.deepEqual(original, ['a', 'b', 'c', 'd']);

  // Out of bounds returns shallow copy unchanged
  const unchanged = moveItemInArray(original, -1, 2);
  assert.deepEqual(unchanged, ['a', 'b', 'c', 'd']);
});

test('formatOrdinalAge formats English ordinals accurately', () => {
  assert.equal(formatOrdinalAge(1), '1st');
  assert.equal(formatOrdinalAge(2), '2nd');
  assert.equal(formatOrdinalAge(3), '3rd');
  assert.equal(formatOrdinalAge(11), '11th');
  assert.equal(formatOrdinalAge(12), '12th');
  assert.equal(formatOrdinalAge(13), '13th');
  assert.equal(formatOrdinalAge(21), '21st');
  assert.equal(formatOrdinalAge(22), '22nd');
  assert.equal(formatOrdinalAge(30), '30th');
});

test('validateBirthdayDetails catches empty required fields and invalid ages', () => {
  const validResult = validateBirthdayDetails(DEFAULT_BIRTHDAY_CONFIG);
  assert.equal(validResult.valid, true);

  const invalidResult = validateBirthdayDetails({
    ...DEFAULT_BIRTHDAY_CONFIG,
    recipientName: '   ',
    age: 0,
    senderName: '',
  });
  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.errors.recipientName);
  assert.ok(invalidResult.errors.age);
  assert.ok(invalidResult.errors.senderName);
});

test('buildCompactShareUrl and extractShareIdFromSearch keep share links short and Nginx-414-safe', () => {
  const url = buildCompactShareUrl('https://example.com', '/', 'dora7x9k2m');
  assert.equal(url, 'https://example.com/?s=dora7x9k2m');
  assert.ok(url.length < 60, 'Compact share URL must stay well under Nginx 414 limits');

  assert.equal(extractShareIdFromSearch('?s=dora7x9k2m'), 'dora7x9k2m');
  assert.equal(extractShareIdFromSearch('?id=dora99abc'), 'dora99abc');
  assert.equal(extractShareIdFromSearch('?mode=studio'), null);
});

test('normalizeBirthdayConfig and generateStandaloneBirthdayHtml preserve personalized details', () => {
  const custom = applyCharacterPreset('shizuka', DEFAULT_BIRTHDAY_CONFIG);
  const normalized = normalizeBirthdayConfig(custom);
  assert.equal(normalized.recipientName, 'Shizuka');
  assert.equal(normalized.appearance.layout, 'anywhere-storybook');

  const html = generateStandaloneBirthdayHtml(normalized);
  assert.ok(html.includes('Happy Birthday, Shizuka!'));
  assert.ok(html.includes('Dear Shizuka,'));
});

test('extractYouTubeVideoId parses watch, short, embed, and bare Doraemon video IDs', () => {
  assert.equal(
    extractYouTubeVideoId('https://www.youtube.com/watch?v=iwncGYFPxmU'),
    'iwncGYFPxmU'
  );
  assert.equal(
    extractYouTubeVideoId('https://youtu.be/iwncGYFPxmU?si=12345'),
    'iwncGYFPxmU'
  );
  assert.equal(
    extractYouTubeVideoId('https://www.youtube.com/embed/iwncGYFPxmU'),
    'iwncGYFPxmU'
  );
  assert.equal(extractYouTubeVideoId('iwncGYFPxmU'), 'iwncGYFPxmU');
  assert.equal(extractYouTubeVideoId('https://example.com/not-youtube'), null);
});

test('getAspectRatioDimensions and buildCanvasFilterString compute accurate crop canvas specs', () => {
  assert.deepEqual(getAspectRatioDimensions('16:9'), { width: 800, height: 450 });
  assert.deepEqual(getAspectRatioDimensions('1:1'), { width: 720, height: 720 });
  assert.equal(
    buildCanvasFilterString({ brightness: 110, contrast: 105, saturation: 120, warmth: 15 }),
    'brightness(110%) contrast(105%) saturate(120%) sepia(15%)'
  );
});

