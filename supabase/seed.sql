-- ============================================================================
-- MotionForge AI — Seed Data
-- ============================================================================
-- Repeatable: uses ON CONFLICT (slug) DO UPDATE for idempotency.
-- Does NOT create auth.users — those are created through Supabase Auth.
-- Does NOT assign real production pricing — values are development placeholders.
-- ============================================================================

-- ── Plans ────────────────────────────────────────────────────────────────────

insert into public.plans (name, slug, description, monthly_price_paise, yearly_price_paise, currency, monthly_credits, max_concurrent_generations, is_active, is_public, sort_order)
values
  (
    'Free',
    'free',
    'Get started with AI video generation. Includes welcome credits only — no recurring credit allocation.',
    0,           -- free
    0,           -- free
    'INR',
    0,           -- no recurring monthly credits
    1,           -- 1 concurrent generation
    true,        -- active
    true,        -- publicly visible
    10
  ),
  (
    'Starter',
    'starter',
    'For creators getting started. Monthly credits and faster generation.',
    null,        -- pricing TBD after provider cost review
    null,        -- pricing TBD
    'INR',
    100,         -- development placeholder — not final
    2,
    false,       -- inactive until pricing is set
    false,       -- not publicly visible yet
    20
  ),
  (
    'Creator',
    'creator',
    'For professional creators. Higher credit allocation and priority generation.',
    null,        -- pricing TBD
    null,        -- pricing TBD
    'INR',
    500,         -- development placeholder — not final
    4,
    false,       -- inactive until pricing is set
    false,       -- not publicly visible yet
    30
  )
on conflict (slug) do update set
  name                       = excluded.name,
  description                = excluded.description,
  monthly_price_paise        = excluded.monthly_price_paise,
  yearly_price_paise         = excluded.yearly_price_paise,
  currency                   = excluded.currency,
  monthly_credits            = excluded.monthly_credits,
  max_concurrent_generations = excluded.max_concurrent_generations,
  is_active                  = excluded.is_active,
  is_public                  = excluded.is_public,
  sort_order                 = excluded.sort_order,
  updated_at                 = now();

-- ── Credit Packs ─────────────────────────────────────────────────────────────

insert into public.credit_packs (name, slug, description, credits, price_paise, currency, is_active, is_public, sort_order)
values
  (
    '50 Credits',
    'credits-50',
    'A small credit pack to top up your balance.',
    50,
    0,          -- pricing TBD
    'INR',
    false,      -- inactive until pricing is set
    false,
    10
  ),
  (
    '200 Credits',
    'credits-200',
    'A medium credit pack with better value.',
    200,
    0,          -- pricing TBD
    'INR',
    false,
    false,
    20
  ),
  (
    '500 Credits',
    'credits-500',
    'A large credit pack for heavy creators.',
    500,
    0,          -- pricing TBD
    'INR',
    false,
    false,
    30
  )
on conflict (slug) do update set
  name        = excluded.name,
  description = excluded.description,
  credits     = excluded.credits,
  price_paise = excluded.price_paise,
  currency    = excluded.currency,
  is_active   = excluded.is_active,
  is_public   = excluded.is_public,
  sort_order  = excluded.sort_order,
  updated_at  = now();

-- ── AI Models ────────────────────────────────────────────────────────────────
-- Development-safe placeholder. Cannot be enabled until a real provider_model_id
-- and credit costs are configured. The is_active constraint enforces this.

insert into public.ai_models (
  provider, provider_model_id, name, slug, description,
  generation_type, base_credit_cost, credit_cost_per_second,
  supported_durations, supported_aspect_ratios,
  supports_image_input, supports_text_input, supports_negative_prompt,
  is_active, is_featured, configuration
)
values (
  'fal',
  null,                   -- no real model ID yet
  'Development Image-to-Video Model',
  'dev-image-to-video',
  'A placeholder AI model for development. Configure provider_model_id and credit costs before activating.',
  'image_to_video',
  0,                      -- placeholder cost
  0,                      -- placeholder cost per second
  array[3, 5, 10]::smallint[],
  array['16:9', '9:16', '1:1', '4:3', '3:4']::text[],
  true,                   -- supports image input
  true,                   -- supports text prompt
  false,                  -- no negative prompt support
  false,                  -- INACTIVE — cannot be used until configured
  false,
  '{}'::jsonb
)
on conflict (slug) do update set
  provider                = excluded.provider,
  provider_model_id       = excluded.provider_model_id,
  name                    = excluded.name,
  description             = excluded.description,
  generation_type         = excluded.generation_type,
  base_credit_cost        = excluded.base_credit_cost,
  credit_cost_per_second  = excluded.credit_cost_per_second,
  supported_durations     = excluded.supported_durations,
  supported_aspect_ratios = excluded.supported_aspect_ratios,
  supports_image_input    = excluded.supports_image_input,
  supports_text_input     = excluded.supports_text_input,
  supports_negative_prompt = excluded.supports_negative_prompt,
  is_active               = excluded.is_active,
  is_featured             = excluded.is_featured,
  configuration           = excluded.configuration,
  updated_at              = now();
