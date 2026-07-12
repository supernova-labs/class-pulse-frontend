import { buildJoinUrl } from "./joinUrl";

describe("buildJoinUrl", () => {
  it("returns a URL containing /join?code= with the given code", () => {
    const url = buildJoinUrl("ABC");
    expect(url).toContain("/join?code=ABC");
  });

  it("percent-encodes special characters in the code", () => {
    const url = buildJoinUrl("A B&C");
    expect(url).toContain("/join?code=A%20B%26C");
  });
});
