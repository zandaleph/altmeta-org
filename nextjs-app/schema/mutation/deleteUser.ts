import {
  arg,
  objectType,
  inputObjectType,
  mutationField,
  nonNull,
} from "nexus";
import UserService from "../../src/backend/UserService";

const DeleteUserInput = inputObjectType({
  name: "DeleteUserInput",
  definition(t) {
    t.id("id");
  },
});

const DeleteUserPayload = objectType({
  name: "DeleteUserPayload",
  definition(t) {
    t.id("id");
  },
});

export default mutationField("deleteUser", {
  type: DeleteUserPayload,
  args: {
    input: nonNull(arg({ type: DeleteUserInput })),
  },
  async resolve(_root, args, ctx) {
    const id = args.input.id;
    if (!id || !id.startsWith("EmailUser:")) {
      throw new Error("Must supply valid id for deleteUser");
    }
    const sub = id.replace("EmailUser:", "");
    const userService = new UserService(ctx.session.bearerToken);
    await userService.deleteUser(sub);
    return {
      id,
    };
  },
});
