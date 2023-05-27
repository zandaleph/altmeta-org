/**
 * @generated SignedSource<<a0d66b55c5f8c1d0d564443b05cee0c3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeleteUserButton_user$data = {
  readonly email?: string | null;
  readonly id: string | null;
  readonly " $fragmentType": "DeleteUserButton_user";
};
export type DeleteUserButton_user$key = {
  readonly " $data"?: DeleteUserButton_user$data;
  readonly " $fragmentSpreads": FragmentRefs<"DeleteUserButton_user">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DeleteUserButton_user",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
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
    }
  ],
  "type": "User",
  "abstractKey": "__isUser"
};

(node as any).hash = "4803732a2b09b35b0e6bf729702828ae";

export default node;
