import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { useTheme } from "../contexts/ThemeContext";

/**
 * Chat Component
 * Handles symptom input and displays AI analysis results
 */
const Chat = () => {
  const [symptoms, setSymptoms] = useState("");
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      role: "bot",
      text: "Hi — saya asisten kesehatan. Jelaskan gejala Anda dan saya akan bantu analisis.",
    },
  ]);
  const [lang, setLang] = useState("id");

  const { analyzeSymptoms, data, loading, error, reset } = useChat();
  const scrollRef = useRef(null);
  const { theme } = useTheme();

  // Naive language detection: prefer Indonesian if common ID words appear
  const detectLanguage = (text) => {
    if (!text) return "en";
    const s = text.toLowerCase();
    const idWords = [
      "saya",
      "kamu",
      "kalian",
      "demam",
      "sakit",
      "berapa",
      "selama",
      "kenapa",
      "sudah",
      "hari",
      "perut",
      "mengapa",
      "saya",
    ];
    for (const w of idWords) {
      if (s.includes(w)) return "id";
    }
    // fallback: if contains common English words, return 'en'
    const enWords = ["the", "and", "is", "i", "you", "have", "my"];
    for (const w of enWords) {
      if (s.includes(` ${w} `) || s.startsWith(w + " ") || s.endsWith(" " + w))
        return "en";
    }
    return "en";
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!symptoms.trim()) {
      return;
    }

    const userMessage = { id: Date.now(), role: "user", text: symptoms };
    setMessages((m) => [...m, userMessage]);
    setLang(detectLanguage(userMessage.text));
    setSymptoms("");

    // Trigger analysis and show typing state (loading comes from hook)
    await analyzeSymptoms(userMessage.text);
    // when analyzeSymptoms resolves, we'll append bot message in effect below
  };

  /**
   * Handle input change
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    setSymptoms(e.target.value);
    // Clear error and result when user starts typing
    if (error || data) {
      reset();
    }
  };

  /**
   * Handle reset/clear
   */
  const handleReset = () => {
    setSymptoms("");
    reset();
  };

  // When new `data` or `error` arrives, append a bot message (localized and cleaned)
  useEffect(() => {
    if (loading) return; // wait until finished

    if (error) {
      const errText =
        lang === "id" ? `Terjadi kesalahan: ${error}` : `Error: ${error}`;
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, role: "bot", text: errText },
      ]);
      return;
    }

    if (data) {
      // try to parse JSON-like advice but never print raw JSON
      const tryParse = (maybe) => {
        if (!maybe) return null;
        if (typeof maybe === "object") return maybe;
        const s = String(maybe).trim();
        if (s.startsWith("{") || s.startsWith("[")) {
          try {
            return JSON.parse(s);
          } catch (e) {
            return null;
          }
        }
        return s;
      };

      const parsed = tryParse(data.advice);

      const t = (idText, enText) => (lang === "id" ? idText : enText);

      const parts = [];
      if (data.condition)
        parts.push(
          t(
            `Berdasarkan deskripsi, kemungkinan: ${data.condition}.`,
            `Based on your description, possible: ${data.condition}.`,
          ),
        );
      if (data.severity)
        parts.push(
          t(
            `Tingkat keparahannya diperkirakan ${data.severity}.`,
            `Estimated severity: ${data.severity}.`,
          ),
        );

      if (parsed) {
        if (typeof parsed === "string") {
          parts.push(t(`Saran perawatan: ${parsed}`, `Advice: ${parsed}`));
        } else if (typeof parsed === "object") {
          if (parsed.advice)
            parts.push(
              t(
                `Saran perawatan: ${parsed.advice}`,
                `Advice: ${parsed.advice}`,
              ),
            );
          else if (parsed.condition && !data.condition)
            parts.push(
              t(
                `Kemungkinan: ${parsed.condition}`,
                `Possible: ${parsed.condition}`,
              ),
            );
          else {
            // readable summary from object
            const kv = Object.entries(parsed)
              .map(([k, v]) => `${k}: ${v}`)
              .join("; ");
            parts.push(t(`Saran: ${kv}`, `Info: ${kv}`));
          }
        }
      } else if (data.advice) {
        parts.push(
          t(`Saran perawatan: ${data.advice}`, `Advice: ${data.advice}`),
        );
      }

      if (data.doctor_visit)
        parts.push(t(`${data.doctor_visit}`, `${data.doctor_visit}`));
      if (data.disclaimer)
        parts.push(
          t(`Catatan: ${data.disclaimer}`, `Note: ${data.disclaimer}`),
        );

      const botText =
        parts.filter(Boolean).join("\n\n") ||
        (lang === "id"
          ? "Maaf, saya tidak bisa memberikan analisis dengan informasi ini."
          : "Sorry, I can't provide an assessment with the given information.");

      setMessages((m) => [
        ...m,
        { id: Date.now() + 2, role: "bot", text: botText },
      ]);
    }
  }, [data, error, loading, lang]);

  // Auto-scroll to bottom on messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2
          className={`text-3xl font-bold mb-2 ${
            theme === "dark"
              ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
              : "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
          }`}
        >
          Symptom Checker
        </h2>
        <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
          Describe your symptoms and get AI-powered health guidance
        </p>
      </div>

      {/* Chat Window */}
      <div className={`card p-0 overflow-hidden ${theme === "dark" ? "" : ""}`}>
        <div className="chat-window h-96 flex flex-col">
          <div
            ref={scrollRef}
            className="chat-messages flex-1 overflow-auto p-4 space-y-4"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`message ${m.role === "user" ? "user" : "bot"} animate-fade-in`}
              >
                <div className="bubble">
                  {m.text.split("\n").map((line, i) => (
                    <p key={i} className="whitespace-pre-wrap">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="message bot">
                <div className="bubble typing">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-3 items-end">
              <textarea
                id="symptoms"
                value={symptoms}
                onChange={handleInputChange}
                placeholder="Tulis pesan... (contoh: demam dan sakit kepala selama 2 hari)"
                className="input-field min-h-[48px] max-h-36 resize-none flex-1"
                disabled={loading}
                required
              />
              <button
                type="submit"
                disabled={loading || !symptoms.trim()}
                className="btn-primary"
              >
                {loading ? "..." : "Kirim"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Removed separate Analysis Result panel — replies now appear inline in the chat */}
    </div>
  );
};

export default Chat;
