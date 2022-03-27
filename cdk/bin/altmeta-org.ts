#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AltmetaOrgStack } from "../lib/altmeta-org-stack";

const app = new cdk.App();

new AltmetaOrgStack(app, "AltmetaBeta", { domainPrefix: "altmeta-beta" });
new AltmetaOrgStack(app, "AltmetaProd");
