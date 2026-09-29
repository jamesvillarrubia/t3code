import { describe, expect, it } from "vite-plus/test";
import {
  formatOpenThreadAction,
  parseOpenThreadAction,
  parseThreadDeepLink,
} from "./threadDeepLink.ts";

const ENV = "3f2b8c1e-5a4d-4c0e-9d7a-1b2c3d4e5f60";
const THREAD = "9a8b7c6d-1e2f-4a3b-8c5d-6e7f80912345";

describe("parseThreadDeepLink", () => {
  it.each(["t3code", "t3code-dev"])("accepts %s://thread/<env>/<thread>", (scheme) => {
    expect(parseThreadDeepLink(`${scheme}://thread/${ENV}/${THREAD}`)).toEqual({
      environmentId: ENV,
      threadId: THREAD,
    });
  });

  it("accepts a trailing slash, a query, and a fragment", () => {
    expect(parseThreadDeepLink(`t3code://thread/${ENV}/${THREAD}/?x=1#y`)).toEqual({
      environmentId: ENV,
      threadId: THREAD,
    });
  });

  it.each([
    ["wrong host", `t3code://app/${ENV}/${THREAD}`],
    ["wrong scheme", `https://thread/${ENV}/${THREAD}`],
    ["extra segments", `t3code://thread/${ENV}/${THREAD}/extra`],
    ["one segment", `t3code://thread/${ENV}`],
    ["no segments", "t3code://thread/"],
    ["empty string", ""],
    ["not a url", "thread/a/b"],
    ["empty environment segment", `t3code://thread//${THREAD}`],
    ["encoded slash", `t3code://thread/${ENV}/a%2Fb`],
    ["encoded dot segment", `t3code://thread/${ENV}/%2e%2e`],
    ["dot-dot segment", `t3code://thread/${ENV}/..`],
    ["credentials", `t3code://user@thread/${ENV}/${THREAD}`],
    ["port", `t3code://thread:8080/${ENV}/${THREAD}`],
    ["javascript scheme", `javascript:alert(1)//thread/${ENV}/${THREAD}`],
    ["javascript in id", `t3code://thread/${ENV}/javascript:alert(1)`],
    ["script in id", `t3code://thread/${ENV}/%3Cscript%3E`],
  ])("rejects %s", (_name, url) => {
    expect(parseThreadDeepLink(url)).toBeNull();
  });
});

describe("open-thread menu action", () => {
  it("round-trips a link", () => {
    const link = { environmentId: ENV, threadId: THREAD };
    expect(parseOpenThreadAction(formatOpenThreadAction(link))).toEqual(link);
  });

  it.each(["open-settings", "open-thread:", `open-thread:${ENV}`, `open-thread:${ENV}/a/b`])(
    "ignores %s",
    (action) => {
      expect(parseOpenThreadAction(action)).toBeNull();
    },
  );
});
