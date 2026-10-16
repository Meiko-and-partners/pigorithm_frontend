"use client";

import { useFarmContext } from "@/lib/auth/AuthProvider";
import { backend } from "./backend";
import { useApiQuery } from "./useApiQuery";

/** Farm-scoped lists for the current farm, refetched when the farm changes. */
export function usePigs() {
  const { farm } = useFarmContext();
  return useApiQuery(`${farm.id}:pigs`, (signal) => backend.listPigs(farm.id, signal));
}

export function useCollars() {
  const { farm } = useFarmContext();
  return useApiQuery(`${farm.id}:collars`, (signal) => backend.listCollars(farm.id, signal));
}

export function useGateways() {
  const { farm } = useFarmContext();
  return useApiQuery(`${farm.id}:gateways`, (signal) => backend.listGateways(farm.id, signal));
}
