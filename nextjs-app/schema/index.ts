import { makeSchema, connectionPlugin } from "nexus";
import path from "path";
import * as QueryTypes from "./query";
import * as MutationTypes from "./mutation";
import * as Types from "./types";

const schema = makeSchema({
  types: [Types, QueryTypes, MutationTypes],
  features: {
    abstractTypeStrategies: {
      __typename: true,
    },
  },
  shouldGenerateArtifacts: process.env.NODE_ENV === "development",
  outputs: {
    typegen: path.join(process.cwd(), "generated/nexus-typegen.ts"),
    schema: path.join(process.cwd(), "generated/schema.graphql"),
  },
  plugins: [connectionPlugin()],
});

export default schema;
