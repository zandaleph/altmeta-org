import { Construct } from "constructs";
import {
  aws_lambda as lambda,
  aws_lambda_nodejs as lambda_nodejs,
  Duration,
} from "aws-cdk-lib";
import * as triggers from "aws-cdk-lib/triggers";
import * as path from "path";
import {
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
export interface InitialUserTriggerProps {
  stackName: string;
  userPoolId: string;
}

export class InitialUserTrigger extends Construct {
  constructor(scope: Construct, id: string, props: InitialUserTriggerProps) {
    super(scope, id);
    const addInitialUserPolicyStatement = new PolicyStatement({
      actions: [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminCreateUser",
      ],
      resources: ["*"],
      conditions: {
        StringEquals: { "aws:ResourceTag/altmeta-stack": props.stackName },
      },
    });

    const addInitialUserPolicy = new ManagedPolicy(this, "FuncPolicy");
    addInitialUserPolicy.addStatements(addInitialUserPolicyStatement);

    // This policy covers the logs: actions above
    // const lambdaBasicPolicy = ManagedPolicy.fromAwsManagedPolicyName(
    //   "service-role/AWSLambdaBasicExecutionRole"
    // );

    const addInitialUserRole = new Role(this, "FuncRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });
    addInitialUserRole.addManagedPolicy(addInitialUserPolicy);

    // This seems to have added a requirement on a running docker daemon
    // Might replace this with inline js since it should be fairly simple
    const addInitialUserFunc = new lambda_nodejs.NodejsFunction(this, "Func", {
      memorySize: 128,
      timeout: Duration.seconds(5),
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "main",
      entry: path.join(__dirname, "initial-user-handler.ts"),
      environment: {
        ALTMETA_USER_POOL_ID: props.userPoolId,
      },
      role: addInitialUserRole,
      bundling: {
        minify: true,
      },
    });

    new triggers.Trigger(this, "Trigger", {
      handler: addInitialUserFunc,
    });
  }
}
