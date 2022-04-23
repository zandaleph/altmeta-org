/**
 * @generated SignedSource<<40b56ba8e39babb00d854f9b719a28ff>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UserRow_user$data = {
  readonly id: string | null;
  readonly isAdmin: boolean | null;
  readonly email?: string | null;
  readonly " $fragmentSpreads": FragmentRefs<"DeleteUserButton_user">;
  readonly " $fragmentType": "UserRow_user";
};
export type UserRow_user$key = {
  readonly " $data"?: UserRow_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"UserRow_user">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserRow_user",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isAdmin",
      "storageKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "email",
          "storageKey": null
        }
      ],
      "type": "EmailUser",
      "abstractKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "DeleteUserButton_user"
    }
  ],
  "type": "User",
  "abstractKey": "__isUser"
};

(node as any).hash = "225299b273d23e1c9cd46669fd638a1d";

export default node;
