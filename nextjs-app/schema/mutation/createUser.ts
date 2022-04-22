import {
  arg,
  objectType,
  inputObjectType,
  mutationField,
  nonNull,
} from "nexus";
import UserService from "../../src/backend/UserService";
import User from "../types/User";

const CreateUserInput = inputObjectType({
  name: "CreateUserInput",
  definition(t) {
    t.string("email");
  },
});

const CreateUserPayload = objectType({
  name: "CreateUserPayload",
  definition(t) {
    t.field("user", { type: User });
  },
});

export default mutationField("createUser", {
  type: CreateUserPayload,
  args: {
    input: nonNull(arg({ type: CreateUserInput })),
  },
  async resolve(_root, args, ctx) {
    const email = args.input.email;
    if (!email) {
      throw new Error("Must supply email for createUser");
    }
    const userService = new UserService(ctx.session.bearerToken);
    const user = await userService.createUser(email);
    return {
      user: {
        __typename: "EmailUser" as const,
        id: `EmailUser:${user.id}`,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    };
  },
});
