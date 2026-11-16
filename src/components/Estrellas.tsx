import { LuStar } from "react-icons/lu";

interface EstrellasProps {
  puntaje: number;
  className?: string;
  alElegir?: (puntaje: number) => void;
}

export default function Estrellas({
  puntaje,
  className = "w-3 h-3",
  alElegir,
}: EstrellasProps) {
  const numeros = [1, 2, 3, 4, 5];

  return (
    <div className="flex gap-0.5">
      {numeros.map((numero) => (
        <button
          key={numero}
          type="button"
          onClick={() => alElegir && alElegir(numero)}
          className={alElegir ? "cursor-pointer" : "cursor-default"}
        >
          <LuStar
            className={`${className} ${numero <= puntaje
                ? "fill-coral text-coral"
                : "fill-borde text-borde"
              }`}
          />
        </button>
      ))}
    </div>
  );
}
