interface HamburguesaIconProps {
  className?: string;
  abierta?: boolean;
}

export default function HamburguesaIcon({
  className = "w-7 h-7",
  abierta = false,
}: HamburguesaIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pan de abajo */}
      <path
        d="M3.5 17.2h17v1.3a2.5 2.5 0 0 1-2.5 2.5H6a2.5 2.5 0 0 1-2.5-2.5z"
        fill="#F2A65A"
      />
      {/* Carne */}
      <rect x="2.5" y="13.6" width="19" height="3.6" rx="1.8" fill="#6B3A2A" />
      {/* Queso */}
      <path
        d="M3 12.8h18l-2.2 2.2-2-1.2-2.4 1.6-2.4-1.6-2.4 1.6-2-1.2z"
        fill="#FFC93C"
      />
      {/* Lechuga */}
      <path
        d="M2.5 12.2c1.2-1 2.4-1 3.6 0s2.4 1 3.6 0 2.4-1 3.6 0 2.4 1 3.6 0 2.4-1 3.6 0v1.1h-18z"
        fill="#7BC96F"
      />

      {/* Pan de arriba: cuando el menú está abierto se levanta */}
      <g
        transform={abierta ? "translate(0 -3) rotate(-12 12 11)" : undefined}
      >
        <path
          d="M3.5 11c0-4.4 3.8-7.5 8.5-7.5s8.5 3.1 8.5 7.5z"
          fill="#F2A65A"
        />
        {/* Sésamo */}
        <ellipse cx="8.4" cy="7.2" rx=".75" ry=".45" fill="#FFF3DC" />
        <ellipse cx="12" cy="5.7" rx=".75" ry=".45" fill="#FFF3DC" />
        <ellipse cx="15.6" cy="7.4" rx=".75" ry=".45" fill="#FFF3DC" />
        <ellipse cx="11" cy="9" rx=".75" ry=".45" fill="#FFF3DC" />
        <ellipse cx="14" cy="9.2" rx=".75" ry=".45" fill="#FFF3DC" />
      </g>
    </svg>
  );
}
