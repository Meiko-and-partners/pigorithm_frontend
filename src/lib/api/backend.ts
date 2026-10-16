import { api } from "@/lib/auth/session";
import { endpoints } from "./endpoints";

/** Typed backend endpoints bound to the app's authenticated client. */
export const backend = endpoints(api);
