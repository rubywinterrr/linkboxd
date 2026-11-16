interface AvatarProps {
  iniciales: string;
  color: string;
  className?: string;
}

// Fondos oscuros llevan las letras claras
const fondosOscuros = ["#131116", "#1c1921", "#2a0f1e", "#8b3dff"];

export default function Avatar({
  iniciales,
  color,
  className = "w-9 h-9 text-[13px]",
}: AvatarProps) {
  const textoClaro = fondosOscuros.includes(color);

  return (
    <div
      style={{ backgroundColor: color }}
      className={`rounded-full flex items-center justify-center shrink-0 font-karla font-bold ${textoClaro ? "text-texto" : "text-fondo"
        } ${className}`}
    >
      {iniciales}
    </div>
  );
}
