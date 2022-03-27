import * as React from "react";
import type { NextPage } from "next";
import Typography from "@mui/material/Typography";

const Home: NextPage = () => {
  return (
    <>
      <Typography variant="h3" component="h1" gutterBottom>
        Alt⎇⬥Meta
      </Typography>
      <Typography variant="body1" gutterBottom>
        People talking without speaking
        <br />
        People hearing without listening
        <br />
        People writing songs that voices never shared
        <br />
        And no one dared disturb the sound of silence
        <Typography textAlign="right">- Paul Simon</Typography>
      </Typography>
      <Typography variant="body1">
        Blog posts have not been migrated yet, so for now, silence.
      </Typography>
    </>
  );
};

export default Home;
