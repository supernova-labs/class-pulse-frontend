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

  describe("hostile input", () => {
    it("escapes <style> so it cannot restyle the app", () => {
      expect(formatText("<style>:root{--color-accent:red}</style>")).toBe(
        "&lt;style&gt;:root{--color-accent:red}&lt;/style&gt;",
      );
    });

    it("escapes <img onerror> so it cannot execute", () => {
      expect(formatText("<img src=x onerror=alert(1)>")).toBe("&lt;img src=x onerror=alert(1)&gt;");
    });

    it("does not link javascript: URLs", () => {
      const out = formatText("javascript:alert(1)");
      expect(out).toBe("javascript:alert(1)");
      expect(out).not.toContain("<a");
    });

    it("does not link a javascript: URL disguised inside an anchor", () => {
      expect(formatText('<a href="javascript:alert(1)">x</a>')).toBe(
        "&lt;a href=&quot;javascript:alert(1)&quot;&gt;x&lt;/a&gt;",
      );
    });

    it("escapes quotes and ampersands", () => {
      expect(formatText(`he said "hi" & 'bye'`)).toBe("he said &quot;hi&quot; &amp; &#39;bye&#39;");
    });

    it("escapes HTML inside bold and italic markers", () => {
      expect(formatText("**<b onmouseover=alert(1)>x</b>**")).toBe(
        "<b>&lt;b onmouseover=alert(1)&gt;x&lt;/b&gt;</b>",
      );
    });

    it("escapes an author name containing HTML", () => {
      expect(formatText("@<img src=x onerror=alert(1)>")).toBe(
        "@&lt;img src=x onerror=alert(1)&gt;",
      );
    });

    it("cannot break out of the generated href attribute", () => {
      expect(formatText('https://ok.com/"onmouseover="alert(1)')).toBe(
        '<a href="https://ok.com/&quot;onmouseover=&quot;alert(1)" target="_blank" rel="noreferrer">https://ok.com/&quot;onmouseover=&quot;alert(1)</a>',
      );
    });
  });
});
