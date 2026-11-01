import { createClient } from '@supabase/supabase-js';
import { BirthdayConfig } from '../types/birthday';
import {
  getPersonalizedViewConfig,
  normalizeBirthdayConfig,
} from './birthdayLogic';

export const SUPABASE_PROJECT_ID = 'bwmsywizdfjakoghyjma';
export const SUPABASE_URL =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_SUPABASE_URL) ||
  `https://${SUPABASE_PROJECT_ID}.supabase.co`;

export const SUPABASE_PUBLISHABLE_KEY =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env.VITE_SUPABASE_ANON_KEY)) ||
  'sb_publishable_1zYEH-f8ipMmxpStFtm8UQ_-gsdwSfb';

export const SUPABASE_TABLE_NAME = 'birthday_websites';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface SupabaseBirthdayRow {
  id: string;
  recipient_name: string;
  nickname: string;
  age: number;
  birthday_date: string;
  sender_name: string;
  relationship: string;
  headline: string;
  personal_message: string;
  letter_greeting: string;
  letter_body: string;
  letter_sign_off: string;
  final_headline: string;
  final_subtext: string;
  memories: BirthdayConfig['memories'];
  wishes: BirthdayConfig['wishes'];
  funny_moments: BirthdayConfig['funnyMoments'];
  gadget_surprises: BirthdayConfig['gadgetSurprises'];
  music: BirthdayConfig['music'];
  appearance: BirthdayConfig['appearance'];
  sections: BirthdayConfig['sections'];
  config: BirthdayConfig;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseSaveResult {
  ok: boolean;
  id: string;
  tableMissing?: boolean;
  error?: string;
}

export const SUPABASE_SQL_SETUP_QUERY = `-- Run this query in your Supabase Dashboard -> SQL Editor -> New Query
-- Project ID: bwmsywizdfjakoghyjma

create table if not exists public.birthday_websites (
  id text primary key,
  recipient_name text not null default 'Birthday Star',
  nickname text not null default '',
  age integer not null default 20,
  birthday_date text not null default '',
  sender_name text not null default 'Your Besties',
  relationship text not null default 'Best Friend',
  headline text not null default 'Happy Birthday! 🎂✨',
  personal_message text not null default '',
  letter_greeting text not null default '',
  letter_body text not null default '',
  letter_sign_off text not null default '',
  final_headline text not null default '',
  final_subtext text not null default '',
  memories jsonb not null default '[]'::jsonb,
  wishes jsonb not null default '[]'::jsonb,
  funny_moments jsonb not null default '[]'::jsonb,
  gadget_surprises jsonb not null default '[]'::jsonb,
  music jsonb not null default '{}'::jsonb,
  appearance jsonb not null default '{}'::jsonb,
  sections jsonb not null default '{}'::jsonb,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_birthday_websites_recipient_name
  on public.birthday_websites (recipient_name);

create index if not exists idx_birthday_websites_updated_at
  on public.birthday_websites (updated_at desc);

create or replace function public.handle_birthday_websites_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_birthday_websites_updated_at on public.birthday_websites;
create trigger trg_birthday_websites_updated_at
  before update on public.birthday_websites
  for each row
  execute function public.handle_birthday_websites_updated_at();

alter table public.birthday_websites enable row level security;

drop policy if exists "Allow public select on birthday_websites" on public.birthday_websites;
create policy "Allow public select on birthday_websites"
  on public.birthday_websites
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow public insert on birthday_websites" on public.birthday_websites;
create policy "Allow public insert on birthday_websites"
  on public.birthday_websites
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow public update on birthday_websites" on public.birthday_websites;
create policy "Allow public update on birthday_websites"
  on public.birthday_websites
  for update
  to anon, authenticated
  using (true)
  with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.birthday_websites to anon, authenticated;

notify pgrst, 'reload schema';`;

/**
 * Converts a BirthdayConfig and short ID into a structured Supabase row payload.
 */
export function buildSupabaseRowPayload(
  shortId: string,
  rawConfig: BirthdayConfig
): SupabaseBirthdayRow {
  const personalized = getPersonalizedViewConfig(
    normalizeBirthdayConfig(rawConfig)
  );
  return {
    id: shortId,
    recipient_name: personalized.recipientName || 'Birthday Star',
    nickname: personalized.nickname || '',
    age: Number.isFinite(personalized.age) ? personalized.age : 20,
    birthday_date: personalized.birthdayDate || '',
    sender_name: personalized.senderName || 'Your Besties',
    relationship: personalized.relationship || 'Best Friend',
    headline: personalized.headline || 'Happy Birthday! 🎂✨',
    personal_message: personalized.personalMessage || '',
    letter_greeting: personalized.letterGreeting || '',
    letter_body: personalized.letterBody || '',
    letter_sign_off: personalized.letterSignOff || '',
    final_headline: personalized.finalHeadline || '',
    final_subtext: personalized.finalSubtext || '',
    memories: Array.isArray(personalized.memories) ? personalized.memories : [],
    wishes: Array.isArray(personalized.wishes) ? personalized.wishes : [],
    funny_moments: Array.isArray(personalized.funnyMoments)
      ? personalized.funnyMoments
      : [],
    gadget_surprises: Array.isArray(personalized.gadgetSurprises)
      ? personalized.gadgetSurprises
      : [],
    music: personalized.music,
    appearance: personalized.appearance,
    sections: personalized.sections,
    config: personalized,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Hydrates a BirthdayConfig from a Supabase row (combining structured columns and `config` JSONB).
 */
export function hydrateConfigFromSupabaseRow(
  row: Partial<SupabaseBirthdayRow> | null | undefined
): BirthdayConfig | null {
  if (!row || typeof row !== 'object') return null;

  const baseConfig =
    row.config && typeof row.config === 'object' ? row.config : {};

  const merged: Partial<BirthdayConfig> = {
    ...baseConfig,
    recipientName:
      typeof row.recipient_name === 'string' && row.recipient_name.trim()
        ? row.recipient_name
        : baseConfig.recipientName,
    nickname:
      typeof row.nickname === 'string' ? row.nickname : baseConfig.nickname,
    age:
      typeof row.age === 'number' && Number.isFinite(row.age)
        ? row.age
        : baseConfig.age,
    birthdayDate:
      typeof row.birthday_date === 'string' && row.birthday_date
        ? row.birthday_date
        : baseConfig.birthdayDate,
    senderName:
      typeof row.sender_name === 'string' && row.sender_name.trim()
        ? row.sender_name
        : baseConfig.senderName,
    relationship:
      typeof row.relationship === 'string' && row.relationship
        ? row.relationship
        : baseConfig.relationship,
    headline:
      typeof row.headline === 'string' && row.headline
        ? row.headline
        : baseConfig.headline,
    personalMessage:
      typeof row.personal_message === 'string' && row.personal_message
        ? row.personal_message
        : baseConfig.personalMessage,
    letterGreeting:
      typeof row.letter_greeting === 'string' && row.letter_greeting
        ? row.letter_greeting
        : baseConfig.letterGreeting,
    letterBody:
      typeof row.letter_body === 'string' && row.letter_body
        ? row.letter_body
        : baseConfig.letterBody,
    letterSignOff:
      typeof row.letter_sign_off === 'string' && row.letter_sign_off
        ? row.letter_sign_off
        : baseConfig.letterSignOff,
    finalHeadline:
      typeof row.final_headline === 'string' && row.final_headline
        ? row.final_headline
        : baseConfig.finalHeadline,
    finalSubtext:
      typeof row.final_subtext === 'string' && row.final_subtext
        ? row.final_subtext
        : baseConfig.finalSubtext,
    memories:
      Array.isArray(row.memories) && row.memories.length > 0
        ? row.memories
        : baseConfig.memories,
    wishes:
      Array.isArray(row.wishes) && row.wishes.length > 0
        ? row.wishes
        : baseConfig.wishes,
    funnyMoments:
      Array.isArray(row.funny_moments) && row.funny_moments.length > 0
        ? row.funny_moments
        : baseConfig.funnyMoments,
    gadgetSurprises:
      Array.isArray(row.gadget_surprises) && row.gadget_surprises.length > 0
        ? row.gadget_surprises
        : baseConfig.gadgetSurprises,
    music:
      row.music && typeof row.music === 'object' && Object.keys(row.music).length > 0
        ? (row.music as BirthdayConfig['music'])
        : baseConfig.music,
    appearance:
      row.appearance &&
      typeof row.appearance === 'object' &&
      Object.keys(row.appearance).length > 0
        ? (row.appearance as BirthdayConfig['appearance'])
        : baseConfig.appearance,
    sections:
      row.sections &&
      typeof row.sections === 'object' &&
      Object.keys(row.sections).length > 0
        ? (row.sections as BirthdayConfig['sections'])
        : baseConfig.sections,
  };

  if (typeof merged.recipientName !== 'string') {
    return null;
  }

  return normalizeBirthdayConfig(merged);
}

/**
 * Upserts a birthday website configuration directly into Supabase (`public.birthday_websites`).
 */
export async function saveWebsiteToSupabase(
  shortId: string,
  config: BirthdayConfig
): Promise<SupabaseSaveResult> {
  const cleanId = (shortId || '').trim();
  if (!cleanId) {
    return { ok: false, id: cleanId, error: 'Missing share ID' };
  }

  const payload = buildSupabaseRowPayload(cleanId, config);

  try {
    const { error } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      const isTableMissing =
        error.code === 'PGRST205' ||
        error.code === '42P01' ||
        (error.message || '').includes('birthday_websites');
      return {
        ok: false,
        id: cleanId,
        tableMissing: isTableMissing,
        error: error.message,
      };
    }

    return { ok: true, id: cleanId };
  } catch (err) {
    return {
      ok: false,
      id: cleanId,
      error: err instanceof Error ? err.message : 'Network error saving to Supabase',
    };
  }
}

/**
 * Fetches a shared birthday website configuration from Supabase (`public.birthday_websites`) by short ID.
 */
export async function fetchWebsiteFromSupabase(
  shortId: string
): Promise<BirthdayConfig | null> {
  const cleanId = (shortId || '').trim();
  if (!cleanId) return null;

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .select('*')
      .eq('id', cleanId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return hydrateConfigFromSupabaseRow(data as Partial<SupabaseBirthdayRow>);
  } catch {
    return null;
  }
}
