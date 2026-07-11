import createClient from "openapi-fetch";
import { API_URL } from "../appConfig";
import { clearAdminToken, getAdminToken } from "../lib/storage";
import type { paths } from "./schema";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const client = createClient<paths>({ baseUrl: API_URL });

client.use({
  onRequest({ request }) {
    const token = getAdminToken();
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  },
});

interface FetchResult<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

export function unwrap<T>(result: FetchResult<T>): T {
  failOnError(result);
  return result.data as T;
}

export function failOnError(result: FetchResult<unknown>): void {
  if (result.error !== undefined || !result.response.ok) {
    const status = result.response.status;
    if (status === 401) clearAdminToken();
    const detail =
      typeof result.error === "object" && result.error !== null && "detail" in result.error
        ? String((result.error as { detail: unknown }).detail)
        : `Request failed (${status})`;
    throw new ApiError(status, detail);
  }
}
