export default function handler(_req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(410).json({
    success: false,
    message: "Cookie-based Roblox sign-in is disabled. Use this site's account login.",
  });
}

