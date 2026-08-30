"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ZaviraChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Assalamu'alaikum 👋 Saya ZAVIRA AI. Ada yang ingin ditanyakan tentang zakat, infak, atau sedekah? Silakan, saya bantu.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(e?: FormEvent) {
    e?.preventDefault();

    const text = message.trim();

    if (!text || loading) return;

    setMessage("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text,
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch("/api/zavira", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.reply ||
            "Terjadi kesalahan saat menghubungi ZAVIRA."
        );
      }

      const answer =
        typeof data?.reply === "string"
          ? data.reply.trim()
          : "";

      if (!answer) {
        throw new Error(
          data?.error || "ZAVIRA tidak memberikan jawaban."
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (error) {
      console.error("ZAVIRA CHAT ERROR:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Maaf, ZAVIRA sedang mengalami gangguan. Silakan coba lagi beberapa saat.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>

{/* FLOATING BUTTON */}
{!open && (
  <div
    className="fixed z-[9999]"
    style={{
      right:
        "max(16px, calc((100vw - 430px) / 2 + 16px))",
      bottom: "90px",
    }}
  >
    {/* GLOW / PULSE */}
    <span
      className="
        absolute
        -inset-1
        rounded-full
        bg-green-500/25
        blur-sm
        animate-pulse
      "
    />

    {/* OUTER RING */}
    <span
      className="
        absolute
        -inset-0.5
        rounded-full
        border
        border-green-400/30
        animate-ping
      "
    />

    {/* BUTTON */}
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Tanya ZAVIRA AI"
      className="
        relative
        flex
        items-center
        gap-1.5
        rounded-full
        border
        border-green-100
        bg-white
        py-1.5
        pl-1.5
        pr-2
        shadow-[0_4px_16px_rgba(0,0,0,0.18)]
        transition-all
        duration-200
        hover:scale-105
        hover:shadow-[0_6px_22px_rgba(22,163,74,0.35)]
        active:scale-95
      "
    >
      {/* ZAVIRA ICON */}
      <span
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-green-700
          text-xs
          font-extrabold
          text-white
          shadow-sm
        "
      >
        Z
      </span>

      {/* LABEL */}
      <span className="flex flex-col items-start leading-none">
        <span className="text-[8px] font-medium text-slate-500">
          Tanya
        </span>

        <span className="mt-0.5 text-[10px] font-extrabold text-green-700">
          ZAVIRA AI
        </span>
      </span>

      {/* AI DOT */}
      <span
        className="
          absolute
          right-0.5
          top-0.5
          h-1.5
          w-1.5
          rounded-full
          bg-emerald-400
          shadow-[0_0_6px_rgba(52,211,153,0.9)]
        "
      />
    </button>
  </div>
)}

      {/* CHAT POPUP */}
      {open && (
        <div
          className="
            fixed
            bottom-3
            left-1/2
            z-[9999]
            flex
            h-[72vh]
            w-[calc(100vw-24px)]
            max-w-[390px]
            -translate-x-1/2
            flex-col
            overflow-hidden
            rounded-3xl
            border
            border-emerald-100
            bg-white
            shadow-2xl
            sm:bottom-6
            sm:left-auto
            sm:right-6
            sm:h-[680px]
            sm:max-h-[calc(100vh-48px)]
            sm:translate-x-0
          "
        >
          {/* HEADER */}
          <div className="flex shrink-0 items-center justify-between bg-[#F4C430] px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-extrabold text-green-700 shadow-sm">
                Z
              </div>

              <div>
                <h2 className="text-sm font-bold">
                  ZAVIRA AI
                </h2>

                <p className="text-[10px] text-green-50">
                  Zakat Virtual Assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup ZAVIRA"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-xl
                hover:bg-white/10
              "
            >
              ×
            </button>
          </div>

          {/* INFO */}
          <div className="border-b border-green-100 bg-green-50 px-4 py-2">
            <p className="text-center text-[10px] text-green-800">
              ZAVIRA AI • Zakat Virtual Assistant
            </p>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto bg-slate-50 px-3 py-4">
            <div className="space-y-3">
              {messages.map((item, index) => {
                const isUser = item.role === "user";

                return (
                  <div
                    key={`${item.role}-${index}`}
                    className={`flex ${
                      isUser
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`
                        max-w-[85%]
                        rounded-2xl
                        px-4
                        py-3
                        text-sm
                        leading-relaxed
                        ${
                          isUser
                            ? "rounded-br-md bg-green-700 text-white"
                            : "rounded-bl-md border border-slate-100 bg-white text-slate-700 shadow-sm"
                        }
                      `}
                    >
                      {!isUser && (
                        <div className="mb-1 text-[10px] font-bold text-green-700">
                          ZAVIRA AI
                        </div>
                      )}

                      <div className="whitespace-pre-wrap">
                        {item.content}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* LOADING */}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-green-600" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-green-600 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-green-600 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* WHATSAPP */}
          <a
            href="https://wa.me/6287700377773"
            target="_blank"
            rel="noopener noreferrer"
            className="
              mx-3
              mb-2
              flex
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-green-600
              px-4
              py-2.5
              text-xs
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:bg-green-700
              active:scale-[0.98]
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0 fill-white"
              aria-hidden="true"
            >
              <path d="M20.52 3.48A11.87 11.87 0 0 0 12.07 0C5.5 0 .15 5.35.15 11.92c0 2.1.55 4.15 1.6 5.96L.05 24l6.26-1.64a11.9 11.9 0 0 0 5.76 1.47h.01c6.57 0 11.92-5.35 11.92-11.92 0-3.19-1.24-6.18-3.48-8.43ZM12.08 21.8h-.01a9.88 9.88 0 0 1-5.04-1.38l-.36-.21-3.72.98.99-3.63-.23-.37a9.87 9.87 0 0 1-1.52-5.27C2.19 6.46 6.62 2.03 12.08 2.03c2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.9 6.99c0 5.46-4.43 9.89-9.89 9.89Zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.21 5.09 4.5.71.31 1.27.5 1.7.64.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
            </svg>

            <span>Hubungi Petugas BAZNAS NTB</span>
          </a>

          {/* INPUT */}
          <form
            onSubmit={sendMessage}
            className="shrink-0 border-t border-slate-100 bg-white p-3"
          >
            <div
              className="
                flex
                items-end
                gap-2
                rounded-2xl
                border
                border-slate-200
                bg-slate-50
                p-2
                focus-within:border-green-400
              "
            >
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    !e.shiftKey
                  ) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Tulis pertanyaan..."
                rows={1}
                disabled={loading}
                className="
                  min-h-[40px]
                  flex-1
                  resize-none
                  bg-transparent
                  px-2
                  py-2
                  text-sm
                  outline-none
                  placeholder:text-slate-400
                "
              />

              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-green-700
                  text-lg
                  text-white
                  hover:bg-green-800
                  disabled:opacity-40
                "
              >
                ↑
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}