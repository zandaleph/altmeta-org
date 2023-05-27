import schema from "../../schema";
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from "@apollo/server/plugin/landingPage/default";
import { getServerSession } from "next-auth/next";
import { GraphQLError } from "graphql";
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { authOptions } from "./auth/[...nextauth]";

const landingPagePlugin =
  process.env.NODE_ENV == "development"
    ? ApolloServerPluginLandingPageLocalDefault()
    : ApolloServerPluginLandingPageProductionDefault();

const server = new ApolloServer({
  schema,
  plugins: [landingPagePlugin],
});

export default startServerAndCreateNextHandler(server, {
  async context(req, res) {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      throw new GraphQLError("you must be logged in, fool", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }
    return { req, res, session };
  },
});

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };
