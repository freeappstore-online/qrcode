import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Shell } from "./components/Shell";

type Size = "small" | "medium" | "large";
const SIZES: Record<Size, number> = { small: 200, medium: 300, large: 400 };

export default function App() {
  const [text, setText] = useState("");
  const [size, setSize] = useState<Size>("medium");
  const [color, setColor] = useState("#000000");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!text) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }
    QRCode.toCanvas(canvas, text, {
      width: SIZES[size],
      margin: 2,
      color: { dark: color, light: "#ffffff" },
    });
  }, [text, size, color]);

  useEffect(() => {
    generate();
  }, [generate]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !text) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const px = SIZES[size];

  return (
    <Shell>
      <h1
        className="text-3xl font-bold mb-6"
        style={{ fontFamily: "Fraunces, serif" }}
      >
        QR Code Generator
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Controls */}
        <div className="flex flex-col gap-4 w-full lg:w-80 shrink-0">
          {/* Text input */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              Text or URL
            </span>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text or URL..."
              className="px-3 py-2 rounded-[0.75rem] outline-none text-sm"
              style={{
                border: "1px solid var(--line)",
                background: "var(--panel)",
                color: "var(--ink)",
              }}
            />
          </label>

          {/* Size */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              Size
            </span>
            <div className="flex gap-2">
              {(Object.keys(SIZES) as Size[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className="px-3 py-1.5 rounded-[0.75rem] text-sm capitalize transition-colors"
                  style={{
                    background: size === s ? "var(--accent)" : "var(--panel)",
                    color: size === s ? "#ffffff" : "var(--ink)",
                    border: `1px solid ${size === s ? "var(--accent)" : "var(--line)"}`,
                  }}
                >
                  {s} ({SIZES[s]}px)
                </button>
              ))}
            </div>
          </label>

          {/* Color */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium" style={{ color: "var(--muted)" }}>
              Foreground Color
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-[0.75rem] border-none cursor-pointer"
                style={{ background: "var(--panel)" }}
              />
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {color}
              </span>
            </div>
          </label>

          {/* Download */}
          <button
            onClick={download}
            disabled={!text}
            className="px-4 py-2 rounded-[0.75rem] text-sm font-medium transition-opacity"
            style={{
              background: "var(--accent)",
              color: "#ffffff",
              opacity: text ? 1 : 0.5,
              cursor: text ? "pointer" : "not-allowed",
            }}
          >
            Download PNG
          </button>
        </div>

        {/* QR Code Preview */}
        <div
          className="flex items-center justify-center rounded-[1.25rem] p-6"
          style={{ border: "1px solid var(--line)", background: "var(--panel)" }}
        >
          <canvas
            ref={canvasRef}
            width={px}
            height={px}
            style={{ width: px, height: px }}
          />
        </div>
      </div>
    </Shell>
  );
}
