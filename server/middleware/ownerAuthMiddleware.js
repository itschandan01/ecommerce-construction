export const isOwner = (req, res, next) => {
  const adminEmail = (
    process.env.ADMIN_EMAIL ||
    process.env.EMAIL_USER ||
    "adityaenterprisesofficial62@gmail.com"
  )
    .toLowerCase()
    .trim();

  const userEmail = (req.user?.email || "").toLowerCase().trim();

  if (userEmail && userEmail === adminEmail) {
    return next();
  }

  return res.status(403).json({ error: "Access denied. Admin access only." });
};
