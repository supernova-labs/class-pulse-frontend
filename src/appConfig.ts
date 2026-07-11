// The only module reading import.meta.env, so Jest can map it to a stub.
export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
