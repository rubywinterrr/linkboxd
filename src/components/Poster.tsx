interface PosterProps {
  titulo: string;
  color: string;
  tituloArriba?: boolean;
  className?: string;
  textoClassName?: string;
}

// Fondos oscuros llevan el texto claro, el resto lo lleva oscuro
const fondosOscuros = ["#131116", "#1c1921", "#2a0f1e", "#8b3dff"];

export default function Poster({
  titulo,
  color,
  tituloArriba = false,
  className = "w-37 h-55.5",
  textoClassName = "text-[17px]",
}: PosterProps) {
  const textoClaro = fondosOscuros.includes(color);

  return (
    <div
      style={{ backgroundColor: color }}
      className={`p-2.5 rounded-[3px] border border-texto/10 flex flex-col overflow-hidden shrink-0 ${
        tituloArriba ? "justify-start" : "justify-end"
      } ${className}`}
    >
      <p
        className={`font-slab font-bold leading-[1.05] ${
          textoClaro ? "text-texto" : "text-fondo"
        } ${textoClassName}`}
      >
        {titulo}
      </p>
    </div>
  );
}
