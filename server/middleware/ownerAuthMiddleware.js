export const isOwner = (req, res, next) => {
  if (
    req.user &&
    Number(req.user.id) === Number(process.env.OWNER_USER_ID)
  ) {
    return next();
  }

  return res.status(403).json({ error: "Admin access only" });
};
