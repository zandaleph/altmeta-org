/**
 * @generated SignedSource<<29ac659ae2638bf935ea8898786cb89a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type DeleteUserButtonMutation$variables = {
  connectionId: string;
  id: string;
};
export type DeleteUserButtonMutation$data = {
  readonly deleteUser: {
    readonly deletedId: string | null;
  } | null;
};
export type DeleteUserButtonMutation = {
  response: DeleteUserButtonMutation$data;
  variables: DeleteUserButtonMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "connectionId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = [
  {
    "fields": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "kind": "ObjectValue",
    "name": "input"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "deletedId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "DeleteUserButtonMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteUserPayload",
        "kind": "LinkedField",
        "name": "deleteUser",
        "plural": false,
        "selections": [
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "DeleteUserButtonMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeleteUserPayload",
        "kind": "LinkedField",
        "name": "deleteUser",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "deleteEdge",
            "key": "",
            "kind": "ScalarHandle",
            "name": "deletedId",
            "handleArgs": [
              {
                "items": [
                  {
                    "kind": "Variable",
                    "name": "connections.0",
                    "variableName": "connectionId"
                  }
                ],
                "kind": "ListValue",
                "name": "connections"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "f95431b1d4a7494130dc2e4da3eaa479",
    "id": null,
    "metadata": {},
    "name": "DeleteUserButtonMutation",
    "operationKind": "mutation",
    "text": "mutation DeleteUserButtonMutation(\n  $id: ID!\n) {\n  deleteUser(input: {id: $id}) {\n    deletedId\n  }\n}\n"
  }
};
})();

(node as any).hash = "a256fcd9e2d3139f0c2b1b8fa0cecbf4";

export default node;
