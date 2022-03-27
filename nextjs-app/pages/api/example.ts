import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import {
  S3Client,
  ListObjectsCommand,
  ListObjectsCommandOutput,
} from "@aws-sdk/client-s3";

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ListObjectsCommandOutput | null>
) => {
  const session = await getSession({ req });
  const token = session?.bearerToken as string;
  const provider = process.env.COGNITO_ISSUER ?? "";
  const identityPoolId = process.env.COGNITO_IDENTITY_POOL_ID ?? "";

  const credentialsProvider = fromCognitoIdentityPool({
    identityPoolId,
    logins: { [provider]: token },
  });

  const realSub = (await credentialsProvider()).identityId;

  const client = new S3Client({
    credentials: credentialsProvider,
  });

  const command = new ListObjectsCommand({
    Bucket: process.env.S3_BUCKET ?? "",
    Prefix: `cognito/user-data/${realSub}`,
  });

  const result = await client.send(command);

  res.status(200).json(result);
};
