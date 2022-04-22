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
  IdentityPool,
  UserPoolAuthenticationProvider,
} from "@aws-cdk/aws-cognito-identitypool-alpha";
import { ManagedPolicy, PolicyStatement } from "aws-cdk-lib/aws-iam";

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
      userDataAccessStatement,
      cognitoListUserStatement,
      cognitoAdminAddRemoveUserStatement
    );

    const identityPool = new IdentityPool(this, "IdentityPool");

    identityPool.addUserPoolAuthentication(
      new UserPoolAuthenticationProvider({
        userPool,
        disableServerSideTokenCheck: true,
        userPoolClient,
      })
    );

    identityPool.authenticatedRole.addManagedPolicy(authenticatedUserPolicy);

    new InitialUserTrigger(this, "UserTrigger", {
      stackName: domainPrefix,
      userPoolId: userPool.userPoolId,
    });

    Tags.of(this).add("altmeta-stack", domainPrefix);
  }
}
