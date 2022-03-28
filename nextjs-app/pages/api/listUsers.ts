import type { NextApiHandler } from "next";
import { getSession } from "next-auth/react";

import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";

const listUsers: NextApiHandler<ListUsersCommandOutput | null> = async (
  req,
  res
) => {
  const session = await getSession({ req });
  const token = session?.bearerToken as string;
  const provider = process.env.COGNITO_ISSUER ?? "";
  const identityPoolId = process.env.COGNITO_IDENTITY_POOL_ID ?? "";
  const userPoolId = process.env.COGNITO_USER_POOL_ID ?? "";

  const credentialsProvider = fromCognitoIdentityPool({
    identityPoolId,
    logins: { [provider]: token },
  });

  const client = new CognitoIdentityProviderClient({
    credentials: credentialsProvider,
  });

  const result = await client.send(
    new ListUsersCommand({
      UserPoolId: userPoolId,
    })
  );

  res.status(200).json(result);
};

export default listUsers;
