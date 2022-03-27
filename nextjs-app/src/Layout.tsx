import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { FunctionComponent } from "react";
import Copyright from "./Copyright";
import ResponsiveAppBar from "./nav/ResponsiveAppBar";

const Layout: FunctionComponent = ({ children }) => {
  return (
    <>
      <ResponsiveAppBar />
      <Container maxWidth="lg">
        <Box
          sx={{
            my: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {children}
          <Copyright />
        </Box>
      </Container>
    </>
  );
};

export default Layout;
