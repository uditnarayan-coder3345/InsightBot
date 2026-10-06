import { validateEnvironment } from '../config/env.js';
import { supabase } from '../config/supabase.js';
const config = validateEnvironment();
export async function requireUser(req, res, next) {
  if (config.authMode === 'development' && process.env.NODE_ENV !== 'production') {
    if (!config.devUserId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(config.devUserId)) return res.status(503).json({ success: false, error: 'Set DEV_USER_ID to an existing Supabase Auth user UUID for local API testing.' });
    req.user = { id: config.devUserId, email: null, development: true };
    return next();
  }
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return res.status(401).json({ success: false, error: 'A valid Supabase access token is required.' });
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ success: false, error: 'The Supabase access token is invalid or expired.' });
    req.user = { id: data.user.id, email: data.user.email || null, userMetadata: data.user.user_metadata || {}, development: false };
    return next();
  } catch (error) { return next(error); }
}
