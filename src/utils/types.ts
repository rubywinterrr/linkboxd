export type Proyecto = {
  id: number | string;
  titulo: string;
  color: string;
  anio: number;
  puntaje: number;
  tituloArriba?: boolean;
};

export type Fila = {
  id: number | string;
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

export type Usuario = {
  id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  mail: string;
  tipo: "medios" | "outsider";
};

export type Integrante = {
  id: number;
  rol: string;
  nombres: string[];
};

export type Comentario = {
  id: number;
  nombre: string;
  iniciales: string;
  color: string;
  texto: string;
};

export type Resena = {
  id: number;
  nombre: string;
  iniciales: string;
  color: string;
  puntaje: number;
  fecha: string;
  texto: string;
  meGusta: number;
  comentarios: Comentario[];
};