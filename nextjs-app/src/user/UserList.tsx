import { FunctionComponent } from "react";
import { UserListPaginationQuery } from "../../generated/relay/UserListPaginationQuery.graphql";
import { UserList_query$key } from "../../generated/relay/UserList_query.graphql";
import { graphql, usePaginationFragment } from "react-relay";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import AddUserButton from "./AddUserButton";

interface Props {
  query: UserList_query$key;
}

const UserList: FunctionComponent<Props> = (props) => {
  const { data } = usePaginationFragment<
    UserListPaginationQuery,
    UserList_query$key
  >(
    graphql`
      fragment UserList_query on Query
      @refetchable(queryName: "UserListPaginationQuery") {
        users(first: $count, after: $cursor)
          @connection(key: "UserList_query_users") {
          __id
          edges {
            node {
              id
              ... on EmailUser {
                email
              }
            }
          }
        }
      }
    `,
    props.query
  );

  return (
    <>
      <TableContainer component={Paper}>
        <Table aria-label="users table">
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.users?.edges?.map((edge) => {
              const user = edge?.node;
              return user != null ? (
                <TableRow
                  key={user.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{user.email}</TableCell>
                </TableRow>
              ) : null;
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <AddUserButton connectionId={data.users?.__id ?? ""} />
    </>
  );
};

export default UserList;
