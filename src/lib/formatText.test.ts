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

  it("escapes <style> tags as literal text", () => {
    expect(formatText("<style>body{display:none}</style>")).toBe(
      "&lt;style&gt;body{display:none}&lt;/style&gt;",
    );
  });

  it("escapes <img onerror> as literal text", () => {
    expect(formatText("<img src=x onerror=alert(1)>")).toBe("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("escapes raw HTML bold tags as literal text", () => {
    expect(formatText("<b>raw bold</b>")).toBe("&lt;b&gt;raw bold&lt;/b&gt;");
  });
});
