# Altmeta.org Front-End Website (In development)

My previous website's codebase has become unmaintainable, so I'm building a new
version based on a different tech stack.  This package is the [Next.js]
frontend to be hosted on [Vercel].  It relies on an AWS-based backend which is
defined in a [separate CDK package].

# Quick Start

* Clone the repository to your dev environment
* [Follow the CDK instructions]
* Change to this directory
* Run the following to download dependency packages

  `npm install`
* Run the following command to start the hot-reloading dev server

  `npm run dev`
* Point your browser at http://localhost:3000

## Useful Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the hot-reloading dev server |
| `npm run build` | Compile all the typescript and create a ready-to-run website |
| `npm run start` | Run the website built with the previous command |
| `npm run nexus-typegen` | Regenerate the GraphQL schema and server side types |
| `npm run relay` | Regenerate the GraphQL queries and client side types |

# Architecture

A high level overview of technologies used:

* [Next.js] (Web request handling framework)
* [Typescript] (Implementation language)
* [React] (Code-based DOM rendering)
* [Emotion] (CSS-in-JS library)
* [MUI] (Component library for React, provides UI primitives)
* [NextAuth] (OIDC-based authentication library)
* [AWS SDK for Javascript] (Client libraries for AWS-based backend)
* [GraphQL] (Client-facing APIs for rich UIs)
  * [Apollo Server] (The premier Javascript-based GraphQL server)
  * [Nexus] (Code-first GraphQL schema generator)
  * [Relay] (Opinionated, highly effective GraphQL client for React)

The original start for this package was [MUI's nextjs-with-typescript] example.

## GraphQL

For frontend to middle-tier API calls, I use GraphQL. I prefer GraphQL to REST
for this because it makes queries composable, reducing the number of network
calls for pages. Another benefit is getting to use [GraphQL Playground] and
Relay, both of which make development a lot faster once setup.

The [GraphQL Schema] is generated from the code that implements the fields.
Here's [an example query] and [an example mutation].  To generate the schema
and typescript definitions, run `npm run nexus-typegen`. The context parameter
is set in [the graphql api route], where we also extract and enforce a user
session before doing any processing.

Using Relay, our GraphQL queries are broken up into fragments that live with
the components that use them.  You can see an example of this in [`UserRow`].
Relay then generates the actual queries used at runtime and type definitions.
To run this generator, use `npm run relay`. For mutations, we take advantage
of [Relay's Declarative Directives], for example in [`AddUserButton`].

## The link component

The [Link Component] in this package provides a consistent MUI-styled link
which composes the [Next.js Link component] when the href is local.

More information is available in the [MUI NextJS documentation]

## Logout

NextAuth doesn't implement deep logout, which is needed when the OIDC provider
is dedicated to a single application.  See [our custom logout API] for details.

# TODO

* Replace placeholder S3 Query with something more useful
  * Media upload (including photo picker on phones)
    * Consider [react-butterfiles]
  * Gallery view
  * Access control / sharing
* User Administration (Prototype built)
* Profile Self-Service
  * Change password
  * MFA
  * Profile photo?
* Bring Blog Content across
  * MDX support
  * Support legacy paths
  * Build / use a simple CMS? ([Webiny] or [Contentful]?)
* Todo list ;-)
* CardDAV and CalDAV compliant server?
* Solid support?!

<!-- Link References -->
[Next.js]: https://nextjs.org "Next.js website"
[Vercel]: https://vercel.com "Vercel"
[separate CDK package]: ../cdk/README.md "Altmeta.org CDK package"
[Follow the CDK instructions]: ../cdk/README.md#Quick%20Start "Set up the backend"
[Typescript]: https://www.typescriptlang.org/ "Typescript website"
[React]: https://reactjs.org/ "React website"
[Emotion]: https://emotion.sh/ "Emotion JS website"
[MUI]: https://mui.com/ "MUI website"
[NextAuth]: https://next-auth.js.org/ "NextAuth.js website"
[AWS SDK for Javascript]: https://aws.amazon.com/sdk-for-javascript/ "AWS JS SDK"
[GraphQL]: https://graphql.org/
[Apollo Server]: https://www.apollographql.com/docs/apollo-server/
[Nexus]: https://nexusjs.org/
[Relay]: https://relay.dev/
[MUI's nextjs-with-typescript]: https://github.com/mui/material-ui/tree/master/examples/nextjs-with-typescript "Next.js with typescript MUI example"
[GraphQL Playground]: https://github.com/graphql/graphql-playground
[GraphQL Schema]: generated/schema.graphql
[an example query]: schema/query/users.ts
[an example mutation]: schema/mutation/createUser.ts
[the graphql api route]: pages/api/graphql.ts
[`UserRow`]: src/user/UserRow.tsx
[Relay's Declarative Directives]: https://relay.dev/docs/guided-tour/list-data/updating-connections/#using-declarative-directives
[`AddUserButton`]: src/user/AddUserButton.tsx
[Link Component]: src/Link.tsx "Composed MUI and Next.js Link Component"
[Next.js Link component]: https://nextjs.org/docs/api-reference/next/link "Next.js's Link"
[MUI NextJS documentation]: https://mui.com/guides/routing/#next-js "MUI Next.js docs"
[our custom logout API]: pages/api/auth/logout.tsx "Logout API implementation"
[react-butterfiles]: https://github.com/doitadrian/react-butterfiles
[Webiny]: https://www.webiny.com/
[Contentful]: https://www.contentful.com/