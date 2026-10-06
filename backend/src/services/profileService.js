import { supabase } from '../config/supabase.js';

export async function ensureProfile(user) {
  const profile = { id: user.id, email: user.email || null, full_name: user.userMetadata?.full_name || (user.email ? user.email.split('@')[0] : user.development ? 'Local developer' : null) };
  const { error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id', ignoreDuplicates: true });
  if (error) throw new Error(`Could not prepare the user profile: ${error.message}`);
}
