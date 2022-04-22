import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  AttributeType,
  CognitoIdentityProviderClient,
  ListUsersCommand,
  UserType,
} from "@aws-sdk/client-cognito-identity-provider";

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface ListUsersResult {
  users: User[];
  paginationToken?: string | undefined;
}

export default class UserService {
  private client: CognitoIdentityProviderClient;
  private userPoolId = process.env.COGNITO_USER_POOL_ID ?? "";

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
    const result = await this.client.send(
      new ListUsersCommand({
        UserPoolId: this.userPoolId,
        Limit: limit,
        ...(paginationToken ? { PaginationToken: paginationToken } : {}),
      })
    );

    if (!result.Users) {
      throw new Error(
        `Received error code: ${result.$metadata.httpStatusCode}`
      );
    }

    const users = result.Users?.map((user) => this.convertUser(user)) ?? [];

    return {
      users,
      paginationToken: result.PaginationToken,
    };
  }

  async createUser(email: string): Promise<User> {
    const result = await this.client.send(
      new AdminCreateUserCommand({
        UserPoolId: this.userPoolId,
        Username: email,
        UserAttributes: [{ Name: "email", Value: email }],
      })
    );

    if (!result.User) {
      throw new Error(
        `Received error code: ${result.$metadata.httpStatusCode}`
      );
    }

    return this.convertUser(result.User);
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.client.send(
      new AdminGetUserCommand({
        UserPoolId: this.userPoolId,
        Username: id,
      })
    );
    const user = this.convertAttributes(result.UserAttributes);
    if (user.isAdmin) {
      throw new Error("Can't delete admin users");
    }
    await this.client.send(
      new AdminDeleteUserCommand({
        UserPoolId: this.userPoolId,
        Username: id,
      })
    );
  }

  private convertUser(user: UserType): User {
    return this.convertAttributes(user.Attributes);
  }

  private convertAttributes(userAttributes: AttributeType[] | undefined) {
    const attributes: Record<string, string> =
      userAttributes?.reduce((attrs, attr) => {
        return {
          ...attrs,
          ...(attr.Name ? { [attr.Name]: attr.Value } : {}),
        };
      }, {}) ?? {};
    return {
      id: attributes.sub,
      email: attributes.email,
      isAdmin: attributes["custom:is_admin"] == "true",
    };
  }
}
