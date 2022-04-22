import { interfaceType } from "nexus";

export default interfaceType({
  name: "User",
  definition(t) {
    t.id("id", {});
    t.boolean("isAdmin");
  },
});
