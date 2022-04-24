import { Construct } from "constructs";
import {
  ManagedPolicy,
  PolicyStatement,
  Role,
  WebIdentityPrincipal,
} from "aws-cdk-lib/aws-iam";

export interface AltmetaRolesProps {
  bucketArn: string;
  userPoolArn: string;
  identityPoolRef: string;
}

export class AltmetaRoles extends Construct {
  public readonly authenticatedUserRole: Role;
  public readonly adminUserRole: Role;

  constructor(
    scope: Construct,
    id: string,
    { bucketArn, identityPoolRef, userPoolArn }: AltmetaRolesProps
  ) {
    super(scope, id);
    const userDataListStatement = new PolicyStatement({
      actions: ["s3:ListBucket"],
      resources: [bucketArn],
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
        `${bucketArn}/cognito/user-data/\${cognito-identity.amazonaws.com:sub}`,
        `${bucketArn}/cognito/user-data/\${cognito-identity.amazonaws.com:sub}/*`,
      ],
    });

    const cognitoListUserStatement = new PolicyStatement({
      actions: ["cognito-idp:ListUsers"],
      resources: [userPoolArn],
    });

    const cognitoAdminAddRemoveUserStatement = new PolicyStatement({
      actions: [
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminDeleteUser",
      ],
      resources: [userPoolArn],
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
      cognitoListUserStatement,
      cognitoAdminAddRemoveUserStatement
    );

    this.authenticatedUserRole = new Role(this, "AuthenticatedUserRole", {
      assumedBy: new WebIdentityPrincipal("cognito-identity.amazonaws.com", {
        StringEquals: {
          "cognito-identity.amazonaws.com:aud": identityPoolRef,
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated",
        },
      }),
    });
    this.authenticatedUserRole.addManagedPolicy(authenticatedUserPolicy);

    this.adminUserRole = new Role(this, "AdminRole", {
      assumedBy: new WebIdentityPrincipal("cognito-identity.amazonaws.com", {
        StringEquals: {
          "cognito-identity.amazonaws.com:aud": identityPoolRef,
        },
        "ForAnyValue:StringLike": {
          "cognito-identity.amazonaws.com:amr": "authenticated",
        },
      }),
    });
    this.adminUserRole.addManagedPolicy(authenticatedUserPolicy);
    this.adminUserRole.addManagedPolicy(adminUserPolicy);
  }
}
