import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken'
} as const;

export const setCookie = (
  response: NextResponse,
  name: string,
  value: string,
  maxAge: number
) => {
  response.cookies.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge
  });
};

export const setAuthCookies = (
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean = false
) => {
  // Access token: 15 minutes
  setCookie(response, COOKIE_NAMES.ACCESS_TOKEN, accessToken, 15 * 60);

  // Refresh token: 7 days or 30 days
  const refreshMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
  setCookie(response, COOKIE_NAMES.REFRESH_TOKEN, refreshToken, refreshMaxAge);
};

export const clearAuthCookies = (response: NextResponse) => {
  response.cookies.delete(COOKIE_NAMES.ACCESS_TOKEN);
  response.cookies.delete(COOKIE_NAMES.REFRESH_TOKEN);
};

export const getAccessToken = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
};

export const getRefreshToken = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;
};
