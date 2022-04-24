import { Construct } from "constructs";
import {
  aws_cognito as cognito,
  aws_s3 as s3,
  Tags,
  StackProps,
  Stack,
} from "aws-cdk-lib";
import { InitialUserTrigger } from "./initial-user-trigger";
import { AltmetaIdentityPool } from "./auth/altmeta-identity-pool";

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

    new AltmetaIdentityPool(this, "AltmetaIdentityPool", {
      bucketArn: bucket.bucketArn,
      userPool,
      userPoolClient,
    });

    new InitialUserTrigger(this, "UserTrigger", {
      stackName: domainPrefix,
      userPoolId: userPool.userPoolId,
    });

    Tags.of(this).add("altmeta-stack", domainPrefix);
  }
}
