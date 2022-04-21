import { Construct } from "constructs";
import {
  aws_cognito as cognito,
  aws_s3 as s3,
  Tags,
  StackProps,
  Stack,
} from "aws-cdk-lib";
import { InitialUserTrigger } from "./initial-user-trigger";
import {
  ManagedPolicy,
  PolicyStatement,
  Role,
  WebIdentityPrincipal,
} from "aws-cdk-lib/aws-iam";

export interface AltmetaOrgStackProps extends StackProps {
  domainPrefix?: string;
}

export class AltmetaOrgStack extends Stack {
  constructor(scope: Construct, id: string, props: AltmetaOrgStackProps = {}) {
    super(scope, id);

    const bucket = new s3.Bucket(this, "UserDataBucket");

    const domainPrefix = props.domainPrefix ?? "altmeta";
    const userPool = new cognito.UserPool(this, "Pool", {
      // mfa: cognito.Mfa.REQUIRED,
      // mfaSecondFactor: { sms: false, otp: true },
      signInAliases: { username: false, email: true },
      standardAttributes: {
        email: {
          required: true,
          mutable: false,
        },
      },
      customAttributes: {
        is_admin: new cognito.BooleanAttribute({ mutable: true }),
      },
    });
    const userPoolClient = userPool.addClient("Website", {
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: ["http://localhost:3000/api/auth/callback/cognito"],
        logoutUrls: ["http://localhost:3000/logout"],
      },
      generateSecret: true,
      userPoolClientName: "website",
      readAttributes: new cognito.ClientAttributes()
        .withStandardAttributes({ email: true, emailVerified: true })
        .withCustomAttributes("is_admin"),
      writeAttributes: new cognito.ClientAttributes().withStandardAttributes({
        email: true,
      }),
    });
    userPool.addDomain("Domain", { cognitoDomain: { domainPrefix } });

    const userDataListStatement = new PolicyStatement({
      actions: ["s3:ListBucket"],
      resources: [bucket.bucketArn],
      conditions: {
        StringLike: {
          "s3:prefix": [
            "cognito/user-data/${cognito-identity.amazonaws.com:sub}",
          ],
        },
      },
    });

    const userDataAccessStatement = new PolicyStatement({
      actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      resources: [
        `${bucket.bucketArn}/cognito/user-data/\${cognito-identity.amazonaws.com:sub}`,
        `${bucket.bucketArn}/cognito/user-data/\${cognito-identity.amazonaws.com:sub}/*`,
      ],
    });

    const cognitoListUserStatement = new PolicyStatement({
      actions: ["cognito-idp:ListUsers"],
      resources: [userPool.userPoolArn],
    });

    const cognitoAdminAddRemoveUserStatement = new PolicyStatement({
      actions: ["cognito-idp:AdminCreateUser", "cognito-idp:AdminDeleteUser"],
      resources: [userPool.userPoolArn],
    });

    const authenticatedUserPolicy = new ManagedPolicy(
      this,
      "AuthenticatedUserPolicy"
    );
    authenticatedUserPolicy.addStatements(
      userDataListStatement,
      userDataAccessStatement
    );

    const adminUserPolicy = new ManagedPolicy(this, "AdminUserPolicy");
    adminUserPolicy.addStatements(
      userDataListStatement,
      userDataAccessStatement,
      cognitoListUserStatement,
      cognitoAdminAddRemoveUserStatement
    );

    const identityPool = new cognito.CfnIdentityPool(this, "IdentityPool", {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });

    const authenticatedUserRole = new Role(this, "AuthenticatedUserRole", {
      assumedBy: new WebIdentityPrincipal("cognito-identity.amazonaws.com", {
        StringEquals: {
          "cognito-identity.amazonaws.com:aud": identityPool.ref,
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated",
        },
      }),
    });
    authenticatedUserRole.addManagedPolicy(authenticatedUserPolicy);

    const adminRole = new Role(this, "AdminRole", {
      assumedBy: new WebIdentityPrincipal("cognito-identity.amazonaws.com", {
        StringEquals: {
          "cognito-identity.amazonaws.com:aud": identityPool.ref,
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated",
        },
      }),
    });
    adminRole.addManagedPolicy(adminUserPolicy);

    new cognito.CfnIdentityPoolRoleAttachment(
      this,
      "identity-pool-role-attachment",
      {
        identityPoolId: identityPool.ref,
        roles: {
          authenticated: authenticatedUserRole.roleArn,
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
                  roleArn: adminRole.roleArn,
                },
              ],
            },
          },
        },
      }
    );

    new InitialUserTrigger(this, "UserTrigger", {
      stackName: domainPrefix,
      userPoolId: userPool.userPoolId,
    });

    Tags.of(this).add("altmeta-stack", domainPrefix);
  }
}
