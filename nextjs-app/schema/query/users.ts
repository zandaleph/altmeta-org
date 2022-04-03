import { queryField } from "nexus";
import UserService from "../../src/backend/UserService";

import User from "../types/User";

export default queryField((t) => {
  t.connectionField("users", {
    type: User,
    disableBackwardPagination: true,
    async resolve(_root, args, ctx, _info) {
      const userService = new UserService(ctx.session.bearerToken);
      const result = await userService.listUsers(args.first ?? 10);
      const edges = result.users.map((user) => {
        return {
          node: {
            __typename: "EmailUser" as const,
            id: `EmailUser:${user.id}`,
            email: user.email,
          },
          cursor: "",
        };
      });
      return {
        edges,
        pageInfo: {
          endCursor: result.paginationToken,
          hasNextPage: !!result.paginationToken,
          hasPreviousPage: false,
        },
      };
    },
  });
});
