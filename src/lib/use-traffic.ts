import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { getTrafficBundle } from "./traffic.functions";
import type { TrafficBundle } from "./traffic.server";

export const trafficQueryOptions = queryOptions({
  queryKey: ["traffic-bundle"],
  queryFn: () => getTrafficBundle() as Promise<TrafficBundle>,
  staleTime: 30_000,
  refetchInterval: 60_000,
});

/** Live traffic bundle: roads, KPIs, analytics, alerts, heatmaps and AI output. */
export function useTraffic(): TrafficBundle {
  return useSuspenseQuery(trafficQueryOptions).data;
}
