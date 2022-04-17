import Button from "@mui/material/Button";
import { FunctionComponent, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import DeleteIcon from "@mui/icons-material/Delete";
import { graphql, useFragment, useMutation } from "react-relay";
import { DeleteUserButtonMutation } from "../../generated/relay/DeleteUserButtonMutation.graphql";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import { DeleteUserButton_user$key } from "../../generated/relay/DeleteUserButton_user.graphql";

interface Props {
  user: DeleteUserButton_user$key;
  connectionId: string;
}

const DeleteUserButton: FunctionComponent<Props> = ({ user, connectionId }) => {
  const [open, setOpen] = useState<boolean>(false);
  const data = useFragment(
    graphql`
      fragment DeleteUserButton_user on User {
        id
        ... on EmailUser {
          email
        }
      }
    `,
    user
  );
  const [commit, isInFlight] = useMutation<DeleteUserButtonMutation>(graphql`
    mutation DeleteUserButtonMutation($id: ID!, $connectionId: ID!) {
      deleteUser(input: { id: $id }) {
        deletedId @deleteEdge(connections: [$connectionId])
      }
    }
  `);

  const handleClose = () => setOpen(false);
  return (
    <>
      <IconButton
        size="small"
        aria-label="delete"
        onClick={() => setOpen(true)}
      >
        <DeleteIcon fontSize="inherit" />
      </IconButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {data.email}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            disabled={isInFlight}
            startIcon={isInFlight ? <CircularProgress /> : undefined}
            onClick={() => {
              commit({
                variables: { id: data.id ?? "", connectionId },
                onCompleted: handleClose,
              });
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteUserButton;
