import schema from "../../schema";
import { ApolloServer } from "apollo-server-micro";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageProductionDefault,
  AuthenticationError,
} from "apollo-server-core";
import { NextApiHandler } from "next";
import { getSession } from "next-auth/react";

const landingPagePlugin =
  process.env.NODE_ENV == "development"
    ? ApolloServerPluginLandingPageGraphQLPlayground({
        settings: {
          "request.credentials": "same-origin",
          "schema.polling.interval": 15000,
        },
      })
    : ApolloServerPluginLandingPageProductionDefault();

const server = new ApolloServer({
  schema,
  plugins: [landingPagePlugin],
  async context({ req }) {
    const session = await getSession({ req });

    if (!session) throw new AuthenticationError("you must be logged in");

    return { session };
  },
});
const serverPromise = server.start();

const graphqlHandler: NextApiHandler<unknown> = async (req, res) => {
  await serverPromise;
  await server.createHandler({
    path: "/api/graphql",
  })(req, res);
};

export default graphqlHandler;

export const config = {
  api: {
    bodyParser: false,
  },
};
