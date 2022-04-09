import * as React from "react";
import type { NextPage } from "next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const Home: NextPage = () => {
  return (
    <>
      <Typography variant="h3" component="h1" gutterBottom>
        Alt⎇⬥Meta
      </Typography>
      <Box>
        <Typography variant="body1" gutterBottom>
          I think this is the beginning of a beautiful friendship.
        </Typography>
        <Typography textAlign="right">- Casablanca</Typography>
      </Box>
      <Typography variant="body1">
        Site under construction, more to come later.
      </Typography>
    </>
  );
};

export default Home;
