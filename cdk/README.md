# Altmeta.org CDK Stacks

This CDK project defines all the AWS infrastructure needed to run [Altmeta].
Currently, [the website itself] is intended to be deployed on [Vercel], but
AWS is used for a number of features.

# Quick Start

* Ensure your [AWS CLI is setup].
* Clone the repository to your dev environment and change to this directory.
* Run this to set up the beta stack.

  `cdk deploy AltmetaBeta`

* Run this to point the local dev website at the Beta backend.

  `npm run print-env -s > ../nextjs-app/.env.development.local`
* The default admin password from [initial-user-handler.ts] will need to be
  changed after first login.
* See the [Website README] for local dev website instructions.

## Useful commands

Note there are currently two possible values for `stack`: AltmetaBeta and
AltmetaProd.

| Command | Description |
|---|---|
| `cdk synth [stack]` | Prints the synthesized CloudFormation template |
| `cdk diff [stack]` | Compare defined stack with currently deployed stack |
| `cdk deploy [stack]` | Deploy (or update) this stack on AWS |
| `npm run print-env -s` | Prints an .env file for developing with the Beta stack |
| `npm run build` | Verify the typescript code compiles |
| `npm run watch` | Watch and build changes to typescript code |
| `npm run test` | Runs Jest, which would be useful if we had tests... |

# Architecture

The [top level stack] is currently focused on setting up a Cognito User Pool
and Identity Pool. This allows us to implement a secure, restricted login where
authenticated users have federated access to some AWS resources.  Right now,
that access is limited to a private, per-user folder in the UserData bucket.

![Altmeta Org Stack Diagram]

(Diagram source: [Altmeta Org Stack Diagram Source], rendered on [mermaid.live])

We've also set up a second class of users - admins, which have additional
access to create and delete users.  This is achieved by adding a custom
property `is_admin` to our user pool, then using role mapping rules on the
identity pool to assign the admin role if the property is set to "true".

![Altmeta Identity Pool Diagram]

(Diagram source: [Altmeta Identity Pool Diagram Source], rendered on [mermaid.live])

## Initial User Trigger

One tricky bit we couldn't get off the shelf was the [initial user trigger].
This component takes a Cognito User Pool and inserts an initial user into it.
Because triggers run on every deployment, the trigger first checks if the user
exists and only creates one if it doesn't already exist.  The lambda handler
is defined in [initial-user-handler.ts], which is transpiled with the
[NodejsFunction] component.

![Initial User Trigger Diagram]

(Diagram source: [Initial User Trigger Diagram Source], rendered on [mermaid.live])

# Other Things of Note

The [`cdk.json`] file tells the CDK Toolkit how to execute your app.

The [`altmeta-org-print-env.ts`] script inspects the deployed AltmetaBeta
CloudFormation stack and prints environment variables for the frontend website.

# Todo

* Replace the placeholder UserDataBucket with something fit for real use cases.
* Replace hard-coding for initial user password with an .env file.
* Figure out how to support developer-specific stacks rather that just two.
  * Replace the hard-coded Cognito hosted ui domain with something flexible.
* Setup Github Actions
  * Deploy prod stack automatically on merge.
  * Setup PR policy and test beta stack automatically on PR.
  * Enforce [conventional commits].
* Put these todos into GitHub Issues.

<!-- Link References -->

[Altmeta]: https://altmeta.org "Altmeta.org"
[the website itself]: ../nextjs-app/README.md "Altmeta.org frontend package"
[Vercel]: https://vercel.com "Vercel"
[AWS CLI is setup]: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html "AWS Command Line Interface Quick Setup"
[initial user trigger]: lib/initial-user-trigger.ts "Deploy-time trigger to setup initial user"
[initial-user-handler.ts]: lib/initial-user-handler.ts "Handler to setup initial user"
[Website README]: ../nextjs-app/README.md "Docs for frontend website code"
[top level stack]: lib/altmeta-org-stack.ts "Source of CDK Stack 'AltmetaOrgStack'"
[Altmeta Org Stack Diagram]: doc/altmeta-org-stack-mermaid.png "Component architecture of Altmeta Org Stack"
[Altmeta Org Stack Diagram Source]: doc/altmeta-org-stack.md "Diagram source for Component architecture of Altmeta Org Stack"
[Altmeta Identity Pool Diagram]: doc/altmeta-identity-pool-mermaid.png "Detail of identity pool and role mapping"
[Altmeta Identity Pool Diagram Source]: doc/altmeta-identity-pool.md "Diagram source for detail of identity pool and role mapping"
[Initial User Trigger Diagram]: doc/initial-user-trigger-mermaid.png "Component architecture of Initial User Trigger Component"
[Initial User Trigger Diagram Source]: doc/initial-user-trigger.md "Diagram source for Component architecture of Initial User Trigger Component"
[mermaid.live]: https://mermaid.live/ "Mermaid Live editor"
[NodejsFunction]: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs.NodejsFunction.html
[conventional commits]: https://www.conventionalcommits.org/ "Conventional Commits Spec"
[`cdk.json`]: cdk.json
[`altmeta-org-print-env.ts`]: bin/altmeta-org-print-env.ts