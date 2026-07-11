import { formatText } from "./formatText";

describe("formatText", () => {
  it("wraps **text** in bold", () => {
    expect(formatText("Vão usar **WebSocket**?")).toBe("Vão usar <b>WebSocket</b>?");
  });

  it("wraps _text_ in italic", () => {
    expect(formatText("Vi _isso_ hoje")).toBe("Vi <i>isso</i> hoje");
  });

  it("auto-links http(s) URLs", () => {
    expect(formatText("veja https://exemplo.com")).toBe(
      'veja <a href="https://exemplo.com" target="_blank" rel="noreferrer">https://exemplo.com</a>',
    );
  });

  it("leaves plain text untouched", () => {
    expect(formatText("uma pergunta simples")).toBe("uma pergunta simples");
  });
});
