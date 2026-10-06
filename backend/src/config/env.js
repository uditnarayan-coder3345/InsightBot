import 'dotenv/config';
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
export function validateEnvironment() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing required backend environment variables: ${missing.join(', ')}. Copy .env.example to .env and add your Supabase project credentials.`);
  const mode = process.env.AUTH_MODE || 'development';
  if (!['development', 'supabase'].includes(mode)) throw new Error('AUTH_MODE must be either development or supabase.');
  if (process.env.NODE_ENV === 'production' && mode !== 'supabase') throw new Error('Production requires AUTH_MODE=supabase so API requests are authenticated.');
  const port = Number(process.env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port between 1 and 65535.');
  try { new URL(process.env.SUPABASE_URL); } catch { throw new Error('SUPABASE_URL must be a valid project URL.'); }
  return { port, supabaseUrl: process.env.SUPABASE_URL, supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY, frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173', authMode: mode, devUserId: process.env.DEV_USER_ID || null };
}
