import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { Suspense, useEffect, FunctionComponent } from "react";
import {
  useQueryLoader,
  graphql,
  PreloadedQuery,
  usePreloadedQuery,
} from "react-relay";
import { gatewayQuery } from "../generated/relay/gatewayQuery.graphql";
import AddUserButton from "../src/user/AddUserButton";
import UserList from "../src/user/UserList";

const query = graphql`
  query gatewayQuery($count: Int!, $cursor: String) {
    ...UserList_query
  }
`;

interface Props {
  queryRef: PreloadedQuery<gatewayQuery>;
}

const UserListComponent: FunctionComponent<Props> = (props) => {
  const data = usePreloadedQuery<gatewayQuery>(query, props.queryRef);
  return (
    <Box>
      <UserList query={data} />
    </Box>
  );
};

const Gateway: NextPage = () => {
  useSession({ required: true });
  const [queryReference, loadQuery] = useQueryLoader<gatewayQuery>(query);

  useEffect(() => {
    loadQuery({ count: 10 });
  }, [loadQuery]);

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        We're on the Gateway!
      </Typography>
      <Suspense fallback={<CircularProgress />}>
        {queryReference != null ? (
          <UserListComponent queryRef={queryReference} />
        ) : null}
      </Suspense>
    </>
  );
};

export default Gateway;
