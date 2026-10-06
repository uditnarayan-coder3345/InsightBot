import { createClient } from '@supabase/supabase-js';
import { validateEnvironment } from './env.js';
const config = validateEnvironment();
export const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
export const DOCUMENTS_BUCKET = 'documents';
let bucketSetup;
export async function ensureDocumentsBucket() {
  if (!bucketSetup) bucketSetup = (async () => {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw new Error(`Could not check Supabase Storage buckets: ${error.message}`);
    const options = { public: false, fileSizeLimit: '25MB', allowedMimeTypes: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] };
    const existing = data.find((bucket) => bucket.name === DOCUMENTS_BUCKET);
    if (existing) {
      const { error: updateError } = await supabase.storage.updateBucket(DOCUMENTS_BUCKET, options);
      if (updateError) throw new Error(`Could not secure Supabase Storage bucket "${DOCUMENTS_BUCKET}": ${updateError.message}`);
      return;
    }
    const { error: createError } = await supabase.storage.createBucket(DOCUMENTS_BUCKET, options);
    if (createError && !/already exists|duplicate/i.test(createError.message)) throw new Error(`Could not create Supabase Storage bucket "${DOCUMENTS_BUCKET}": ${createError.message}`);
  })();
  try { await bucketSetup; } catch (error) { bucketSetup = null; throw error; }
}
