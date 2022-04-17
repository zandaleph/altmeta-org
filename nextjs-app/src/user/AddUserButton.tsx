import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { FunctionComponent, useState } from "react";
import { TextField } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import isEmail from "validator/lib/isEmail";
import InputAdornment from "@mui/material/InputAdornment";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { graphql, useMutation } from "react-relay";
import { AddUserButtonMutation } from "../../generated/relay/AddUserButtonMutation.graphql";
import CircularProgress from "@mui/material/CircularProgress";

interface UserState {
  email: string;
  isValid: boolean;
}

interface Props {
  connectionId: string;
}

const AddUserButton: FunctionComponent<Props> = ({ connectionId }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [user, setUser] = useState<UserState>({ email: "", isValid: false });
  const [commit, isInFlight] = useMutation<AddUserButtonMutation>(graphql`
    mutation AddUserButtonMutation($email: String!, $connectionId: ID!) {
      createUser(input: { email: $email }) {
        user
          @appendNode(connections: [$connectionId], edgeTypeName: "UserEdge") {
          id
          ... on EmailUser {
            email
          }
        }
      }
    }
  `);

  const handleClose = () => setOpen(false);
  return (
    <>
      <Button
        variant="contained"
        aria-label="add"
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
      >
        Add User
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will send an account creation email.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            value={user.email}
            onChange={(e) => {
              const email = e.target.value;
              setUser({ email, isValid: isEmail(email) });
            }}
            fullWidth
            variant="standard"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
            error={!user.isValid}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            disabled={!user.isValid && !isInFlight}
            startIcon={isInFlight ? <CircularProgress /> : undefined}
            onClick={() => {
              commit({
                variables: { email: user.email, connectionId },
                onCompleted: handleClose,
              });
            }}
          >
            Subscribe
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddUserButton;
