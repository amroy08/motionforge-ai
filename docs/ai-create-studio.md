# AI Create Studio (Phase 8)

This document outlines the architecture, data-flow boundaries, validation procedures, and credit-cost calculations for the image-to-video AI Studio.

---

## 1. Studio Architectural Boundary

The `/create` workspace balances Server-Side rendering with interactive Client-Side configurations:

### 1.1 Server Component Boundary
Responsible for authorization, initial database lookups, and security verification:
- Authoritative user verification (`requireActiveUser`).
- Bootstrap queries retrieving credit wallets, active image-to-video models (`is_active = true`), and the 20 newest user-owned input image assets.
- Creation of short-lived (600s) signed preview URLs for display.
- Independent database-backed verification Server Action (`reviewGenerationSettingsAction`).

### 1.2 Client Component Boundary
Handles form input selections, live estimates, picker modals, and upload triggers:
- Form state trackers (active asset selected, prompt, negative prompt, duration, aspect ratio).
- Settings auto-reconciliation (forcing valid aspect ratios/durations when the selected model shifts).
- Form submission to the review Server Action.
- Display states (skeletons during loads, setup error modules, reviewed summaries).

---

## 2. Safe Model DTO & Configurations

We do not trust raw database records. A safe Data Transfer Object is mapped on the server to prevent internal endpoint metadata from reaching client modules:

```ts
export type StudioModel = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  generationType: "image_to_video";
  baseCreditCost: string;
  creditCostPerSecond: string;
  supportedDurations: number[];
  supportedAspectRatios: string[];
  supportsNegativePrompt: boolean;
  featured: boolean;
};
```

### 2.1 Model Config Auditing
Database rows are parsed using a Zod schema. If a model has a malformed format (e.g. durations are negative, aspect ratios are not recognized, or required input fields are false), it is gracefully excluded, preserving layout execution for other healthy active models.

---

## 3. Authoritative Credit Cost Calculation

Live client-side previews estimate cost using JavaScript number arithmetic.
However, the authoritative validation check recalculates cost on the server using a bigint-safe pure utility:

$$ \text{Total Cost} = \text{Base Credit Cost} + (\text{Cost Per Second} \times \text{Duration Seconds}) $$

```ts
const totalCost = BigInt(base) + (BigInt(perSecond) * BigInt(durationSeconds));
```
This isolates calculations from floating-point drifts and ensures validation queries remain accurate.

---

## 4. Settings Review Validation Checklist

The Server Action `reviewGenerationSettingsAction` executes the following check checklist prior to displaying confirmation reviews:
1. **Auth Active Check:** Verifies caller has an active user profile.
2. **Asset Ownership Check:** Reloads the source image from the database. Asserts that the asset exists, belongs to the caller, is of type `input_image`, has not been soft-deleted (`deleted_at is null`), and is not already linked to an existing video generation record (`generation_id is null`).
3. **Model Support Check:** Reloads the selected model row from the database. Asserts that the model is active, supports `image_to_video` types, and accepts both text and image inputs.
4. **Parameter Conformance:** Validates that the selected duration and aspect ratio exist in the model's supported capabilities.
5. **Negative Prompt Check:** Rejects negative prompt input if the selected model does not support it.
6. **Balance Review:** Reloads the wallet balance directly from the database and confirms the balance is equal to or greater than the recalculated total cost.
7. **Refreshed Signed Previews:** Generates a new short-lived signed access URL for the verified asset.

---

## 5. UI Layout & User Experience

The Create page displays a responsive structure:
- **Empty Model State:** If no active models are found in the database, the settings panel disables parameters configuration and presents a user-friendly setup notification.
- **Source Image Selection:** Users can upload a new file directly via the drag-and-drop workspace or click "Choose from Library" to pick from a responsive modal grid showing the 20 preloaded uploads.
- **Form State Invalidation:** To prevent stale confirmation states, any modification to form fields (prompts, aspect ratios, durations, or source images) immediately invalidates the previous review result, requiring a new "Review Settings" validation run.
- **Prompt Privacy:** Text inputs are kept exclusively in component state memory and action payloads. They are never written to URL queries, browser history, localStorage, or DB logs.

---

## 6. Phase 8 Scope & Pipeline Limits

Phase 8 is limited to configuring settings and reviewing validations. It does **not**:
- Insert records into `public.generations`.
- Deduct wallet balances or insert transaction logs.
- Call fal.ai API endpoints or dispatch webhooks.
- Simulate progress trackers or fake video rendering.
The generate action remains strictly disabled, accompanied by next-phase instructions.
