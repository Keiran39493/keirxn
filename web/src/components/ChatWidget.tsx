"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Mode = "donor" | "ngo";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME: Record<Mode, string> = {
  donor: `Hallo! Ich bin Ihr Charity-Assistent, unterstützt durch das **gemeinnuetzig.li** NGO-Verzeichnis.\n\nIch helfe Ihnen, Liechtensteiner Nonprofit-Organisationen zu finden, die wirklich zu Ihren Werten passen — durch ein kurzes Gespräch.\n\n**Zum Einstieg:** Welche Art von Wirkung möchten Sie in der Welt erzielen?`,
  ngo: `Hallo! Ich bin Ihr Fundraising-Berater, basierend auf dem **VLGST-Stiftungsverzeichnis**.\n\nIch helfe Ihrer Organisation dabei, die passenden Stiftungen und Trusts für Ihre Förderbedürfnisse zu identifizieren.\n\n**Zum Einstieg:** Bitte beschreiben Sie Ihre Organisation — was ist Ihr Auftrag?`,
};

function renderMarkdown(text: string): string {
  let html = text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener" class="underline text-gm-600">$1</a>'
    )
    .replace(
      /(^|\s)(https?:\/\/[^\s<]+)/g,
      '$1<a href="$2" target="_blank" rel="noopener" class="underline text-gm-600">$2</a>'
    )
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Wrap consecutive <li> items before converting newlines — avoids needing the ES2018 `s` flag
  html = html.replace(/((?:<li>[^\n]*<\/li>\n?)+)/g, "<ul>$1</ul>");

  html = html
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br>");

  return `<p>${html}</p>`;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("donor");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME.donor },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const changeMode = useCallback(
    (newMode: Mode) => {
      if (streaming) return;
      setMode(newMode);
      setMessages([{ role: "assistant", content: WELCOME[newMode] }]);
    },
    [streaming]
  );

  const clearChat = useCallback(() => {
    if (streaming) return;
    setMessages([{ role: "assistant", content: WELCOME[mode] }]);
  }, [streaming, mode]);

  const sendMessage = useCallback(async () => {
    if (streaming || !input.trim()) return;
    const text = input.trim();
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const history: Message[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const resp = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          mode,
        }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ detail: resp.statusText }));
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: `**Fehler:** ${err.detail ?? resp.statusText}`,
          };
          return updated;
        });
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));
          if (data.done) break;
          if (data.text) {
            fullText += data.text;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: fullText,
              };
              return updated;
            });
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: `**Netzwerkfehler:** ${msg}`,
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }, [streaming, input, messages, mode]);

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {/* Chat panel */}
      {open && (
        <div className="flex flex-col w-[360px] h-[520px] rounded-2xl shadow-2xl overflow-hidden border border-gm-100 bg-white">
          {/* Header */}
          <div className="flex-shrink-0 bg-gm-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-gm-900"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">
                Charity Assistent
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearChat}
                disabled={streaming}
                className="text-xs text-gm-200 hover:text-white transition-colors disabled:opacity-40"
              >
                Löschen
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-gm-200 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex-shrink-0 flex border-b border-gm-100">
            <button
              onClick={() => changeMode("donor")}
              disabled={streaming}
              className={`flex-1 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
                mode === "donor"
                  ? "bg-accent text-gm-900"
                  : "bg-white text-gray-500 hover:bg-gm-50"
              }`}
            >
              Ich bin Spender/Stiftung
            </button>
            <button
              onClick={() => changeMode("ngo")}
              disabled={streaming}
              className={`flex-1 py-2 text-xs font-semibold transition-colors disabled:opacity-60 border-l border-gm-100 ${
                mode === "ngo"
                  ? "bg-accent text-gm-900"
                  : "bg-white text-gray-500 hover:bg-gm-50"
              }`}
            >
              Ich bin eine NGO
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gm-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-start gap-2 max-w-[90%]">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gm-700 flex items-center justify-center mt-0.5">
                      <svg
                        className="w-3 h-3 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z"
                        />
                      </svg>
                    </div>
                    <div className="bg-white border border-gm-100 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-gray-800 shadow-sm leading-relaxed">
                      {msg.content === "" ? (
                        <span className="flex gap-1 py-1">
                          {[0, 1, 2].map((j) => (
                            <span
                              key={j}
                              className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block animate-bounce"
                              style={{ animationDelay: `${j * 0.15}s` }}
                            />
                          ))}
                        </span>
                      ) : (
                        <div
                          className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mt-1 [&_li]:mb-0.5 [&_strong]:font-semibold [&_a]:underline [&_a]:text-gm-600 [&_p+p]:mt-1.5 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                        />
                      )}
                    </div>
                  </div>
                )}
                {msg.role === "user" && (
                  <div className="max-w-[80%] bg-accent text-gm-900 rounded-2xl rounded-tr-sm px-3 py-2 text-xs leading-relaxed">
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 bg-white border-t border-gm-100 px-3 py-2.5 flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize(e.target);
              }}
              onKeyDown={handleKey}
              placeholder="Nachricht eingeben…"
              disabled={streaming}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all max-h-28 disabled:opacity-60"
            />
            <button
              onClick={sendMessage}
              disabled={streaming || !input.trim()}
              className="flex-shrink-0 bg-accent hover:bg-gm-400 text-gm-900 font-bold px-3 py-2 rounded-xl text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Senden
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-gm-800 hover:bg-gm-700 shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label={open ? "Chat schließen" : "Chat öffnen"}
      >
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}