import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";

const Gateway: NextPage = () => {
  useSession({ required: true });
  const [userData, setUserData] = useState<string | undefined>();

  const fetchUserData = async () => {
    const response = await fetch("http://localhost:3000/api/listUsers");
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
