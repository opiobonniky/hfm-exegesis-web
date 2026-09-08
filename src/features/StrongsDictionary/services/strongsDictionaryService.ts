import { sendGetRequest } from "@/services/api";

export interface StrongsSearchParams {
  query: string;
  language?: string;
  limit: number;
  offset: number;
}

const inFlightSearches = new Map<string, Promise<any>>();
const recentSearches = new Map<string, { expiresAt: number; response: any }>();
const SEARCH_CACHE_TTL = 15_000;

export function searchStrongs({
  query,
  language,
  limit,
  offset,
}: StrongsSearchParams) {
  const key = JSON.stringify({
    query: query.trim().toLowerCase(),
    language: language || "all",
    limit,
    offset,
  });

  const existingRequest = inFlightSearches.get(key);
  if (existingRequest) return existingRequest;

  const cached = recentSearches.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.response);
  }

  const request = sendGetRequest("strongs", "search", {
    q: query.trim(),
    language,
    limit,
    offset,
  }).then((response) => {
    recentSearches.set(key, { expiresAt: Date.now() + SEARCH_CACHE_TTL, response });
    return response;
  }).finally(() => inFlightSearches.delete(key));

  inFlightSearches.set(key, request);
  return request;
}
