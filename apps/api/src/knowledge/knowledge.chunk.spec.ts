import { describe, expect, it } from "vitest";

import { splitBodyIntoChunks } from "./knowledge.service";

describe("splitBodyIntoChunks", () => {
  it("splits on paragraphs then respects max width", () => {
    const a = "Para one.\n\nPara two.";
    expect(splitBodyIntoChunks(a)).toEqual(["Para one.", "Para two."]);
  });

  it("returns empty for whitespace", () => {
    expect(splitBodyIntoChunks("   \n  ")).toEqual([]);
  });
});
