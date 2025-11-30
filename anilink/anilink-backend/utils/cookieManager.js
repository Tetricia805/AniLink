const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax'
};

export const attachAuthCookies = (res, tokens) => {
  if (!tokens) return;
  res.cookie('anilink_access', tokens.accessToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 1000 // 1 hour
  });
  res.cookie('anilink_refresh', tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};

export const clearAuthCookies = (res) => {
  res.clearCookie('anilink_access');
  res.clearCookie('anilink_refresh');
};

