import { Type } from "typebox";
import { stringOrList } from "../lib/tool-params.ts";

export const revisions = stringOrList;

export const paths = Type.Optional(Type.Array(Type.String(), { description: "Limit to these paths (filesets)" }));
