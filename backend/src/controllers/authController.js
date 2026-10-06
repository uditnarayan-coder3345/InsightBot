export function getCurrentUser(req, res) {
  res.json({ success: true, data: { id: req.user.id, email: req.user.email, development: req.user.development } });
}
