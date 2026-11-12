interface FooterProps {
  conLinks?: boolean;
}

export default function Footer({ conLinks = false }: FooterProps) {
  return (
    <footer className="w-full px-16 py-7 border-t border-borde flex items-center justify-between">
      <span className="font-slab font-bold text-base text-texto">LinkBoxd</span>
      <span className="font-karla text-[13px] text-apagado">
        ORT - Especialidad Medios de la Comunicación
      </span>
      {conLinks && (
        <div className="flex gap-5 font-karla text-[13px] text-texto-sec">
          <a href="https://www.youtube.com/@ORTMedios" target="_blank">
            YouTube de Medios
          </a>
          <span>Instagram</span>
          <span>Contacto</span>
        </div>
      )}
    </footer>
  );
}
