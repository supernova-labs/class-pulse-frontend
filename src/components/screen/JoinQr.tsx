import { QRCodeSVG } from "qrcode.react";
import { buildJoinUrl } from "../../lib/joinUrl";

interface JoinQrProps {
  code: string;
  variant: "hero" | "chip";
}

export function JoinQr({ code, variant }: JoinQrProps) {
  const value = buildJoinUrl(code);

  if (variant === "chip") {
    return (
      <div
        role="img"
        aria-label="QR code para entrar na sessão"
        className="rounded-xl bg-white p-2 shadow-lg"
      >
        <QRCodeSVG value={value} size={80} />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label="QR code para entrar na sessão"
      className="flex flex-col items-center gap-6"
    >
      <div className="rounded-2xl bg-white p-4 shadow-[0_0_60px_rgb(124_108_255/0.25)]">
        <QRCodeSVG value={value} size={280} />
      </div>
      <p className="font-mono text-3xl font-bold tracking-[0.2em] text-accent-soft">
        {code.toUpperCase()}
      </p>
      <p className="text-lg text-muted">Aponte a câmera para entrar</p>
    </div>
  );
}
