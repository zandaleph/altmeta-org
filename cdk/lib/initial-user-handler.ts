import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  UserNotFoundException,
  AdminCreateUserCommand,
  MessageActionType,
} from "@aws-sdk/client-cognito-identity-provider";

export async function main(
  _: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const client = new CognitoIdentityProviderClient({});

  // Check if the user already exists
  const userPoolId = process.env.ALTMETA_USER_POOL_ID ?? "";
  const adminUsername = "admin@altmeta.org";

  if (await queryUserExists(client, userPoolId, adminUsername)) {
    return {
      body: JSON.stringify({ message: "User already exists" }),
      statusCode: 200,
    };
  }

  const createUserCommand = new AdminCreateUserCommand({
    UserPoolId: userPoolId,
    Username: adminUsername,
    MessageAction: MessageActionType.SUPPRESS,
    TemporaryPassword: "This is a P4ssw0rd",
    UserAttributes: [
      { Name: "email", Value: adminUsername },
      { Name: "email_verified", Value: "True" },
      { Name: "custom:is_admin", Value: "true" },
    ],
  });

  const result = await client.send(createUserCommand);

  console.log(result);

  return {
    body: JSON.stringify({ message: "User was created" }),
    statusCode: 201, // created
  };
}

async function queryUserExists(
  client: CognitoIdentityProviderClient,
  userPoolId: string,
  username: string
) {
  const getUserCommand = new AdminGetUserCommand({
    UserPoolId: userPoolId,
    Username: username,
  });

  try {
    await client.send(getUserCommand);
  } catch (e) {
    if (e instanceof UserNotFoundException) {
      return false;
    }
    throw e;
  }
  return true;
}
