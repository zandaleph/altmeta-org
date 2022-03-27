import { FunctionComponent } from "react";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Button from "@mui/material/Button";
import { useRouter } from "next/router";

const NavProfile: FunctionComponent = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [anchorElUser, setAnchorElUser] = useState<HTMLElement | undefined>();
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(undefined);
  };
  return (
    <Box sx={{ flexGrow: 0 }}>
      {!session && (
        <Button
          variant="contained"
          onClick={() => signIn("cognito", { callbackUrl: "/gateway" })}
        >
          Sign In
        </Button>
      )}
      {session?.user && (
        <>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt={session.user.email ?? "unknown"}>
                {session.user.email?.[0].toUpperCase() ?? "?"}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: "45px" }}
            id="profile-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <MenuItem
              key="Gateway"
              onClick={() => {
                router.push("/gateway");
                handleCloseUserMenu();
              }}
            >
              <Typography textAlign="center">Gateway</Typography>
            </MenuItem>
            <MenuItem
              key="Logout"
              onClick={() => {
                router.push("/api/auth/logout");
                handleCloseUserMenu();
              }}
            >
              <Typography textAlign="center">Logout</Typography>
            </MenuItem>{" "}
          </Menu>
        </>
      )}
    </Box>
  );
};

export default NavProfile;
