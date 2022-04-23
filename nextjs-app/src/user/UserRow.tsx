import { FunctionComponent } from "react";
import { UserRow_user$key } from "../../generated/relay/UserRow_user.graphql";
import { graphql, useFragment } from "react-relay";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import DeleteUserButton from "./DeleteUserButton";

interface Props {
  user: UserRow_user$key;
  connectionId: string;
}

const UserList: FunctionComponent<Props> = ({ user, connectionId }) => {
  const data = useFragment(
    graphql`
      fragment UserRow_user on User {
        id
        isAdmin
        ... on EmailUser {
          email
        }
        ...DeleteUserButton_user
      }
    `,
    user
  );

  return (
    <TableRow
      key={data.id}
      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
    >
      <TableCell>{data.email}</TableCell>
      <TableCell>
        {/* Placeholder until we have "admin" users */}
        {data.isAdmin ? null : (
          <DeleteUserButton user={data} connectionId={connectionId} />
        )}
      </TableCell>
    </TableRow>
  );
};

export default UserList;
