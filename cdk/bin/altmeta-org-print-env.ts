import {
  CloudFormationClient,
  ListStackResourcesCommand,
  ListStacksCommand,
  StackStatus,
} from "@aws-sdk/client-cloudformation";
import {
  CognitoIdentityProviderClient,
  DescribeUserPoolClientCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const main = async () => {
  const stackName = "AltmetaBeta";

  const cfClient = new CloudFormationClient({});
  const cidpClient = new CognitoIdentityProviderClient({});

  const stacks = await cfClient.send(
    new ListStacksCommand({
      StackStatusFilter: [
        StackStatus.CREATE_COMPLETE,
        StackStatus.UPDATE_COMPLETE,
      ],
    })
  );

  const stack = stacks.StackSummaries?.filter((summary) => {
    return summary.StackName == stackName;
  })?.[0];
  if (stack == undefined) {
    throw "Stack not created";
  }

  const resources = await cfClient.send(
    new ListStackResourcesCommand({
      StackName: stackName,
    })
  );

  const userPoolSummary = resources.StackResourceSummaries?.filter(
    (summary) => {
      return summary.ResourceType == "AWS::Cognito::UserPool";
    }
  )?.[0];
  if (userPoolSummary == undefined) {
    throw "Could not find UserPool";
  }

  const clientSummary = resources.StackResourceSummaries?.filter((summary) => {
    return summary.ResourceType == "AWS::Cognito::UserPoolClient";
  })?.[0];
  if (clientSummary == undefined) {
    throw "Could not find UserPoolClient";
  }

  const identityPoolSummary = resources.StackResourceSummaries?.filter(
    (summary) => {
      return summary.ResourceType == "AWS::Cognito::IdentityPool";
    }
  )?.[0];
  if (identityPoolSummary == undefined) {
    throw "Could not find IdentityPool";
  }

  const s3BucketSummary = resources.StackResourceSummaries?.filter(
    (summary) => {
      return summary.ResourceType == "AWS::S3::Bucket";
    }
  )?.[0];
  if (s3BucketSummary == undefined) {
    throw "Could not find Bucket";
  }

  const result = await cidpClient.send(
    new DescribeUserPoolClientCommand({
      UserPoolId: userPoolSummary.PhysicalResourceId,
      ClientId: clientSummary.PhysicalResourceId,
    })
  );

  console.log(`COGNITO_CLIENT_ID=${result.UserPoolClient?.ClientId}`);
  console.log(`COGNITO_CLIENT_SECRET=${result.UserPoolClient?.ClientSecret}`);
  const userPoolId = userPoolSummary.PhysicalResourceId;
  console.log(
    `COGNITO_ISSUER=cognito-idp.us-west-2.amazonaws.com/${userPoolId}`
  );
  console.log(
    `COGNITO_IDENTITY_POOL_ID=${identityPoolSummary.PhysicalResourceId}`
  );
  console.log(`S3_BUCKET=${s3BucketSummary.PhysicalResourceId}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
