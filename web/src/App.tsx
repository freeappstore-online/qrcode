import { useState, useRef, useCallback } from "react";
import { Shell } from "./components/Shell";

type Size = "small" | "medium" | "large";
const SIZES: Record<Size, number> = { small: 200, medium: 300, large: 400 };

function qrUrl(text: string, size: number, fg: string, bg: string) {
  const fgHex = fg.replace("#", "");
  const bgHex = bg.replace("#", "");
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${fgHex}&bgcolor=${bgHex}&format=png`;
}

export function App() {
  const [text, setText] = useState("");
  const [size, setSize] = useState<Size>("medium");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [copied, setCopied] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const px = SIZES[size];
  const src = text ? qrUrl(text, px, fgColor, bgColor) : "";

  const download = useCallback(() => {
    if (!text) return;
    const canvas = document.createElement("canvas");
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;
    if (!ctx || !img) return;
    ctx.drawImage(img, 0, 0, px, px);
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [text, px]);

  const copyToClipboard = useCallback(async () => {
    if (!text) return;
    const canvas = document.createElement("canvas");
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;
    if (!ctx || !img) return;
    ctx.drawImage(img, 0, 0, px, px);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        clearTimeout(copiedTimer.current);
        copiedTimer.current = setTimeout(() => setCopied(false), 2000);
      } catch {
        // fallback: copy the URL
        await navigator.clipboard.writeText(src);
        setCopied(true);
        clearTimeout(copiedTimer.current);
        copiedTimer.current = setTimeout(() => setCopied(false), 2000);
      }
    }, "image/png");
  }, [text, px, src]);

  return (
    <Shell>
      <h1
        className="text-3xl font-bold mb-6"
        style={{ fontFamily: "var(--font-display)" }}
      >
        QR Code Generator
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Controls */}
        <div className="flex flex-col gap-4 w-full lg:w-80 shrink-0">
          {/* Text input */}
          <label className="flex flex-col gap-1.5">
            <span
              className="text-sm font-medium"
              style={{ color: "var(--color-muted)" }}
            >
              Text or URL
            </span>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text or URL..."
              className="px-3 py-2 text-sm outline-none"
              style={{
                borderRadius: "var(--radius-btn)",
                border: "1px solid var(--color-line)",
                background: "var(--color-panel)",
                color: "var(--color-ink)",
              }}
            />
          </label>

          {/* Size */}
          <label className="flex flex-col gap-1.5">
            <span
              className="text-sm font-medium"
              style={{ color: "var(--color-muted)" }}
            >
              Size
            </span>
            <div className="flex gap-2">
              {(Object.keys(SIZES) as Size[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className="px-3 py-1.5 text-sm capitalize transition-colors"
                  style={{
                    borderRadius: "var(--radius-btn)",
                    background:
                      size === s
                        ? "var(--color-accent)"
                        : "var(--color-panel)",
                    color: size === s ? "#ffffff" : "var(--color-ink)",
                    border: `1px solid ${size === s ? "var(--color-accent)" : "var(--color-line)"}`,
                  }}
                >
                  {s} ({SIZES[s]}px)
                </button>
              ))}
            </div>
          </label>

          {/* Foreground Color */}
          <label className="flex flex-col gap-1.5">
            <span
              className="text-sm font-medium"
              style={{ color: "var(--color-muted)" }}
            >
              Foreground Color
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-10 h-10 border-none cursor-pointer"
                style={{
                  borderRadius: "var(--radius-btn)",
                  background: "var(--color-panel)",
                }}
              />
              <span
                className="text-sm font-mono"
                style={{ color: "var(--color-muted)" }}
              >
                {fgColor}
              </span>
            </div>
          </label>

          {/* Background Color */}
          <label className="flex flex-col gap-1.5">
            <span
              className="text-sm font-medium"
              style={{ color: "var(--color-muted)" }}
            >
              Background Color
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 border-none cursor-pointer"
                style={{
                  borderRadius: "var(--radius-btn)",
                  background: "var(--color-panel)",
                }}
              />
              <span
                className="text-sm font-mono"
                style={{ color: "var(--color-muted)" }}
              >
                {bgColor}
              </span>
            </div>
          </label>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={download}
              disabled={!text}
              className="flex-1 px-4 py-2 text-sm font-medium transition-opacity"
              style={{
                borderRadius: "var(--radius-btn)",
                background: "var(--color-accent)",
                color: "#ffffff",
                opacity: text ? 1 : 0.5,
                cursor: text ? "pointer" : "not-allowed",
              }}
            >
              Download PNG
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!text}
              className="flex-1 px-4 py-2 text-sm font-medium transition-opacity"
              style={{
                borderRadius: "var(--radius-btn)",
                background: "var(--color-panel)",
                color: "var(--color-ink)",
                border: "1px solid var(--color-line)",
                opacity: text ? 1 : 0.5,
                cursor: text ? "pointer" : "not-allowed",
              }}
            >
              {copied ? "Copied!" : "Copy to Clipboard"}
            </button>
          </div>
        </div>

        {/* QR Code Preview */}
        <div className="flex flex-1 items-center justify-center">
          <div
            className="flex items-center justify-center p-6"
            style={{
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--color-line)",
              background: "var(--color-panel)",
              minWidth: px + 48,
              minHeight: px + 48,
            }}
          >
            {text ? (
              <img
                ref={imgRef}
                src={src}
                alt="QR Code"
                crossOrigin="anonymous"
                width={px}
                height={px}
                style={{ imageRendering: "pixelated" }}
              />
            ) : (
              <div
                className="flex items-center justify-center text-sm"
                style={{
                  width: px,
                  height: px,
                  color: "var(--color-muted)",
                }}
              >
                Enter text to generate a QR code
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile-only FreeAppStore link */}
      <div
        className="mt-8 text-center text-xs md:hidden"
        style={{ color: "var(--color-muted)" }}
      >
        <a
          href="https://freeappstore.online"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
          style={{ color: "var(--color-muted)" }}
        >
          Part of FreeAppStore — free forever
        </a>
      </div>
    </Shell>
  );
}

export default App;
