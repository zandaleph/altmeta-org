import { FetchFunction } from "relay-runtime";

const fetchGraphQL: FetchFunction = async (query, variables) => {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query.text,
      variables,
    }),
  });

  return await response.json();
};

export default fetchGraphQL;
