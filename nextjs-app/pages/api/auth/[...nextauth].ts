import NextAuth, { AuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CognitoProvider from "next-auth/providers/cognito";
import { Issuer } from "openid-client";

/**
 * Get unix timestamp of token expiry, defaulting to 1 hour from now.
 *
 * @param token The token to pull expires_at from, if present
 * @returns a safe expiry timestamp
 */
function getExpiresAt(token: { expires_at?: unknown }) {
  return token.expires_at ?? Date.now() / 1000 + 3600;
}

/**
 * Helper to show enough of a token to figure out what's going on.
 *
 * Omits most of access, bearer, and refresh tokens, and converts
 * expiresAt to a human-readable ISO date time.
 *
 * @param token The JWT presented to the browser
 * @returns A debug string
 */
function debugRenderToken(token: JWT): string {
  const safeToken = {
    ...token,
    accessToken: (token.accessToken as string).slice(-16),
    bearerToken: (token.bearerToken as string).slice(-16),
    refreshToken: (token.refreshToken as string).slice(-16),
    expiresAt: new Date((token.expiresAt as number) * 1000).toISOString(),
  };
  return JSON.stringify(safeToken);
}

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `expiresAt`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const issuer = await Issuer.discover(
      `https://${process.env.COGNITO_ISSUER}`
    );
    const client = new issuer.Client({
      client_id: process.env.COGNITO_CLIENT_ID ?? "",
      client_secret: process.env.COGNITO_CLIENT_SECRET ?? "",
      redirect_uris: [`http://localhost:3000/gateway`],
      response_types: ["code"],
    });

    const refreshedTokens = await client.refresh(token.refreshToken as string);

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: getExpiresAt(refreshedTokens),
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
      bearerToken: refreshedTokens.id_token,
    };
  } catch (error) {
    console.log(error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID ?? "",
      clientSecret: process.env.COGNITO_CLIENT_SECRET ?? "",
      issuer: `https://${process.env.COGNITO_ISSUER}`,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          isAdmin: profile["custom:is_admin"],
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          accessToken: account.access_token,
          expiresAt: getExpiresAt(account),
          refreshToken: account.refresh_token,
          bearerToken: account.id_token,
          user,
        };
      }

      if (((token.expiresAt ?? 0) as number) < Date.now() / 1000) {
        // Access token has expired, try to update it
        return refreshAccessToken(token);
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      return {
        ...session,
        bearerToken: token.bearerToken ?? session.bearerToken,
        user: token.user as User,
      };
    },
  },
};

export default NextAuth(authOptions);
