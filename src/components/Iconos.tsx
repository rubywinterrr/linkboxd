interface IconoProps {
  className?: string;
}

export function IconoBuscar({ className = "w-4.5 h-4.5" }: IconoProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" strokeWidth={1.75} />
      <path strokeLinecap="round" strokeWidth={1.75} d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function IconoFlecha({ className = "w-3.5 h-3.5" }: IconoProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 12h14M13 6l6 6-6 6"
      />
    </svg>
  );
}

export function IconoEstrella({ className = "w-3 h-3" }: IconoProps) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" />
    </svg>
  );
}

export function IconoEstrellaLinea({ className = "w-4.5 h-4.5" }: IconoProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z"
      />
    </svg>
  );
}

export function IconoLapiz({ className = "w-4 h-4" }: IconoProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinejoin="round" strokeWidth={2} d="M4 20h4L19 9l-4-4L4 16z" />
    </svg>
  );
}

export function IconoDescargar({ className = "w-4 h-4" }: IconoProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v12M6 10l6 6 6-6M4 20h16"
      />
    </svg>
  );
}

export function IconoMail({ className = "w-4 h-4" }: IconoProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="1" strokeWidth={1.75} />
      <path strokeLinejoin="round" strokeWidth={1.75} d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function IconoTelefono({ className = "w-4 h-4" }: IconoProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"
      />
    </svg>
  );
}

export function IconoCorazon({ className = "w-4.5 h-4.5" }: IconoProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"
      />
    </svg>
  );
}

export function IconoMas({ className = "w-4.5 h-4.5" }: IconoProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeWidth={1.75} d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconoUsuario({ className = "w-4.5 h-4.5" }: IconoProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" strokeWidth={1.75} />
      <path strokeLinecap="round" strokeWidth={1.75} d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}

export function IconoConfiguracion({ className = "w-4.5 h-4.5" }: IconoProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" strokeWidth={1.75} />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      />
    </svg>
  );
}

export function IconoCerrarSesion({ className = "w-4.5 h-4.5" }: IconoProps) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
      />
    </svg>
  );
}
