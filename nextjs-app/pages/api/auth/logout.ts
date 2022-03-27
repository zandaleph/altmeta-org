import { NextApiHandler } from "next";
import { Issuer } from "openid-client";

/**
 * API Route to initiate logout.
 *
 * NextAuth does not log out at the provider, choosing only to delete the
 * local session cookie.  This means that if you click logout and then
 * login, you do not need to enter a password as the provider still thinks
 * you are logged in.
 *
 * This handler correctly redirects the browser to the provider logout url,
 * which in turn redirects to our local /logout page.  The logout page is
 * then responsible for calling NextAuth's signOut() API, which is client
 * only.  The /logout page then redirects to the index page.
 *
 * I don't love this flow - there's annoying flickers, and the logic is
 * split across multiple files.  I hope to improve this later.
 */
const logout: NextApiHandler = async (req, res) => {
  try {
    const issuer = await Issuer.discover(
      `https://${process.env.COGNITO_ISSUER}`
    );
    const authUrl = new URL(issuer.metadata.authorization_endpoint!!);
    authUrl.pathname = "/logout";
    authUrl.searchParams.set("client_id", process.env.COGNITO_CLIENT_ID ?? "");
    authUrl.searchParams.set(
      "logout_uri",
      `${process.env.NEXTAUTH_URL}/logout`
    );
    res.redirect(authUrl.href);
  } catch (error) {
    console.error(error);
    // res.status(error.status || 400).end(error.message);
    res.status(400).end("an error occurred");
  }
};

export default logout;
