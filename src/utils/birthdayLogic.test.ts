import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_BIRTHDAY_CONFIG,
  applyCharacterPreset,
  decodeShareConfig,
  encodeShareConfig,
  extractYouTubeVideoId,
  formatOrdinalAge,
  getActiveExperienceSteps,
  moveItemInArray,
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

test('encodeShareConfig and decodeShareConfig round-trip custom birthday configurations', () => {
  const custom = applyCharacterPreset('shizuka', DEFAULT_BIRTHDAY_CONFIG);
  const encoded = encodeShareConfig(custom);
  assert.ok(encoded.length > 20);

  const decoded = decodeShareConfig(encoded);
  assert.ok(decoded);
  assert.equal(decoded?.recipientName, 'Shizuka');
  assert.equal(decoded?.headline, 'Happy Birthday, Shizuka! 🎂✨');
  assert.equal(decoded?.appearance.layout, 'anywhere-storybook');
  assert.equal(decoded?.music.youtubeVideoId, 'iwncGYFPxmU');
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

