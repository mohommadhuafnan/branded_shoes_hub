import jwt from 'jsonwebtoken';

export function getBearer(req) {
  const h = req.headers?.authorization || req.headers?.Authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7).trim() : null;
}

/** Admin JWT from Express login (must include role in payload — redeploy backend auth). */
export function requireAdmin(req) {
  const token = getBearer(req);
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const d = jwt.verify(token, process.env.JWT_SECRET);
    if (d.role !== 'admin') return null;
    return d;
  } catch {
    return null;
  }
}

/** Firebase users store uid in localStorage as Bearer (no dots); admins use JWT with dots. */
export function getFirebaseUidFromRequest(req) {
  const token = getBearer(req);
  if (!token || token.includes('.')) return null;
  return token;
}
