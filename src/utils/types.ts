export type Proyecto = {
  id: number;
  titulo: string;
  color: string;
  anio: number;
  puntaje: number;
  tituloArriba?: boolean;
};

export type Fila = {
  id: number;
  nombre: string;
  cuadrado?: boolean;
  proyectos: Proyecto[];
};

export type ProyectoPerfil = {
  id: number;
  titulo: string;
  color: string;
  tipo: string;
  anio: number;
  rol: string;
  puntaje: number;
};

export type Experiencia = {
  id: number;
  anio: number;
  puesto: string;
  lugar: string;
};
