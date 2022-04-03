import { objectType } from "nexus";

export default objectType({
  name: "EmailUser",
  definition(t) {
    t.implements("User");
    t.string("email");
  },
});
