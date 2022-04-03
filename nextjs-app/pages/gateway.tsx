import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";

const query = JSON.stringify({
  operationName: "HelloQuery",
  variables: {},
  query: `query HelloQuery {
  users(first: 10) {
    edges {
      node {
        id
        ... on EmailUser {
          email
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}`,
});

const Gateway: NextPage = () => {
  useSession({ required: true });
  const [userData, setUserData] = useState<string | undefined>();

  const fetchUserData = async () => {
    const response = await fetch("http://localhost:3000/api/graphql", {
      method: "POST",
      body: query,
      headers: {
        "Content-Type": "application/json",
      },
    });
    setUserData(await response.text());
  };
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        We're on the Gateway!
      </Typography>
      <Button variant="contained" onClick={fetchUserData}>
        List Users
      </Button>
      <textarea value={userData} readOnly></textarea>
    </>
  );
};

export default Gateway;
