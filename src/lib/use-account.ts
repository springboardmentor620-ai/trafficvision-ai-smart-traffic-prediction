import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getAccount, getDirectory } from "./traffic.functions";

export const accountQueryOptions = queryOptions({
  queryKey: ["account"],
  queryFn: () => getAccount(),
  staleTime: 15_000,
});

export const directoryQueryOptions = queryOptions({
  queryKey: ["directory"],
  queryFn: () => getDirectory(),
  staleTime: 15_000,
});

export function useAccount() {
  return useSuspenseQuery(accountQueryOptions).data;
}

/** Platform users + activity log (admins see everyone). */
export function useDirectory() {
  return useSuspenseQuery(directoryQueryOptions).data;
}
