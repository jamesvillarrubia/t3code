export interface ThreadDeepLink {
  readonly environmentId: string;
  readonly threadId: string;
}

const DEEP_LINK_PROTOCOLS: ReadonlySet<string> = new Set(["t3code:", "t3code-dev:"]);
// Host `app` serves the desktop client (see ElectronProtocol), so links use a different host.
const DEEP_LINK_HOST = "thread";
// Covers UUIDs and slug-style ids. The raw path is matched without decoding, so an
// encoded slash or dot segment fails here instead of reaching the router.
const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

/** Parses `t3code://thread/<environmentId>/<threadId>` (or `t3code-dev`). Returns null for anything else. */
export function parseThreadDeepLink(value: string): ThreadDeepLink | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (!DEEP_LINK_PROTOCOLS.has(url.protocol) || url.hostname !== DEEP_LINK_HOST) return null;
  if (url.username !== "" || url.password !== "" || url.port !== "") return null;

  const segments = url.pathname.replace(/\/$/, "").split("/");
  if (segments.length !== 3 || segments[0] !== "") return null;
  const [, environmentId, threadId] = segments;
  if (!environmentId || !threadId) return null;
  if (!ID_PATTERN.test(environmentId) || !ID_PATTERN.test(threadId)) return null;
  return { environmentId, threadId };
}

// The main process forwards a parsed link to the renderer as a menu action string.
const OPEN_THREAD_ACTION_PREFIX = "open-thread:";

export function formatOpenThreadAction(link: ThreadDeepLink): string {
  return `${OPEN_THREAD_ACTION_PREFIX}${link.environmentId}/${link.threadId}`;
}

export function parseOpenThreadAction(action: string): ThreadDeepLink | null {
  if (!action.startsWith(OPEN_THREAD_ACTION_PREFIX)) return null;
  const [environmentId, threadId, ...rest] = action
    .slice(OPEN_THREAD_ACTION_PREFIX.length)
    .split("/");
  if (rest.length > 0 || !environmentId || !threadId) return null;
  if (!ID_PATTERN.test(environmentId) || !ID_PATTERN.test(threadId)) return null;
  return { environmentId, threadId };
}
