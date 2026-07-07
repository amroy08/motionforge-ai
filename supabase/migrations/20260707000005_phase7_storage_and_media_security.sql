-- ============================================================================
-- Phase 7 Migration 5: Storage and Media Security
-- ============================================================================
-- Creates the user-media storage bucket and defines secure RLS policies on
-- storage.objects. Prevents general write overrides and limits reading to
-- owner-specific active directories.
-- ============================================================================

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 1. Create Private Storage Bucket                                         ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-media', 
  'user-media', 
  false, 
  6291456, -- 6 MiB (6 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Row Level Security is enabled by default on storage.objects in Supabase.
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Remove duplicate policies if they exist (supports idempotent re-runs)
DROP POLICY IF EXISTS "Allow active users to read their own media objects" ON storage.objects;

-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║ 3. Define Owner-Isolated SELECT Policy                                   ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
-- Active authenticated users can select objects matching their uid prefix directory
-- under users/{userId}/temporary/... or users/{userId}/inputs/...
CREATE POLICY "Allow active users to read their own media objects"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-media' AND
  (storage.foldername(name))[1] = 'users' AND
  (storage.foldername(name))[2] = (auth.uid())::text AND
  (storage.foldername(name))[3] IN ('temporary', 'inputs') AND
  private.is_active_user() = true
);
