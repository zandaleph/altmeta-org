import { FunctionComponent } from "react";
import { UserListPaginationQuery } from "../generated/relay/UserListPaginationQuery.graphql";
import { UserList_query$key } from "../generated/relay/UserList_query.graphql";
import { graphql, usePaginationFragment } from "react-relay";

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

  return <div>{JSON.stringify(data, undefined, 2)}</div>;
};

export default UserList;
