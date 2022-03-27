import * as React from "react";
import type { NextPage } from "next";
import Typography from "@mui/material/Typography";

const About: NextPage = () => {
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        About Alt⎇⬥Meta
      </Typography>
      <Typography variant="body1">
        This is the personal website of Zack Spellman. I put things here from
        time to time.
      </Typography>
    </>
  );
};

export default About;
