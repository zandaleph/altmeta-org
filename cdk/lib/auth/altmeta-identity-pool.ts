import { Construct } from "constructs";
import { aws_cognito as cognito, Stack } from "aws-cdk-lib";
import { AltmetaRoles } from "./altmeta-roles";

export interface AltmetaIdentityPoolProps {
  bucketArn: string;
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
}

export class AltmetaIdentityPool extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { bucketArn, userPool, userPoolClient }: AltmetaIdentityPoolProps
  ) {
    super(scope, id);

    const identityPool = new cognito.CfnIdentityPool(this, "IdentityPool", {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });

    const altmetaRoles = new AltmetaRoles(this, "AltmetaRoles", {
      bucketArn: bucketArn,
      identityPoolRef: identityPool.ref,
      userPoolArn: userPool.userPoolArn,
    });

    new cognito.CfnIdentityPoolRoleAttachment(this, "IdentityPoolRoleMapping", {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: altmetaRoles.authenticatedUserRole.roleArn,
      },
      roleMappings: {
        mapping: {
          type: "Rules",
          ambiguousRoleResolution: "AuthenticatedRole",
          identityProvider: `cognito-idp.${
            Stack.of(this).region
          }.amazonaws.com/${userPool.userPoolId}:${
            userPoolClient.userPoolClientId
          }`,
          rulesConfiguration: {
            rules: [
              {
                claim: "custom:is_admin",
                matchType: "Equals",
                value: "true",
                roleArn: altmetaRoles.adminUserRole.roleArn,
              },
            ],
          },
        },
      },
    });
  }
}
