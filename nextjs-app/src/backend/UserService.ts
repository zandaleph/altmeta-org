import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";

export interface User {
  id: string;
  email: string;
}

export interface ListUsersResult {
  users: User[];
  paginationToken?: string | undefined;
}

export default class UserService {
  private client: CognitoIdentityProviderClient;

  constructor(token: string) {
    const provider = process.env.COGNITO_ISSUER ?? "";
    const identityPoolId = process.env.COGNITO_IDENTITY_POOL_ID ?? "";

    const credentialsProvider = fromCognitoIdentityPool({
      identityPoolId,
      logins: { [provider]: token },
    });

    this.client = new CognitoIdentityProviderClient({
      credentials: credentialsProvider,
    });
  }

  async listUsers(
    limit: number,
    paginationToken?: string
  ): Promise<ListUsersResult> {
    const userPoolId = process.env.COGNITO_USER_POOL_ID ?? "";

    const result = await this.client.send(
      new ListUsersCommand({
        UserPoolId: userPoolId,
        Limit: limit,
        ...(paginationToken ? { PaginationToken: paginationToken } : {}),
      })
    );

    const users =
      result.Users?.map((user) => {
        const attributes: Record<string, string> =
          user.Attributes?.reduce((attrs, attr) => {
            return {
              ...attrs,
              ...(attr.Name ? { [attr.Name]: attr.Value } : {}),
            };
          }, {}) ?? {};
        return { id: attributes.sub, email: attributes.email };
      }) ?? [];

    return {
      users,
      paginationToken: result.PaginationToken,
    };
  }
}
