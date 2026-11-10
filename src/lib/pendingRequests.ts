const pending = new Map<string, Promise<unknown>>();

/** Share concurrent reads only; settled responses never mask catalog updates or retries. */
export function sharePendingRequest<T>(key: string, load: () => Promise<T>): Promise<T> {
  const existing = pending.get(key);
  if (existing) return existing as Promise<T>;

  const request = Promise.resolve().then(load);
  pending.set(key, request);
  const clear = () => {
    if (pending.get(key) === request) pending.delete(key);
  };
  request.then(clear, clear);
  return request;
}
