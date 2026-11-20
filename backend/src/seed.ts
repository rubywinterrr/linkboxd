import "dotenv/config";
import type { ProjectDocument, UserDocument } from "./models.js";
import { createId, hashPassword } from "./security.js";
import { store } from "./store.js";

const mediosEmail = "demo.medios@ort.edu.ar";
const outsiderEmail = "demo.outsider@example.com";
const seedPassword = process.env.SEED_PASSWORD;
const allowedMediosEmails = new Set(
  (process.env.MEDIOS_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLocaleLowerCase())
    .filter(Boolean),
);

if (!seedPassword || seedPassword.length < 8) {
  throw new Error("Definí SEED_PASSWORD con al menos 8 caracteres antes de ejecutar el seed");
}
if (!allowedMediosEmails.has(mediosEmail)) {
  throw new Error(`Agregá ${mediosEmail} a MEDIOS_EMAILS antes de ejecutar el seed`);
}

await store.initialize();

const [mediosPasswordHash, outsiderPasswordHash] = await Promise.all([
  hashPassword(seedPassword),
  hashPassword(seedPassword),
]);
const now = new Date().toISOString();
const mediosUser: UserDocument = {
  id: createId("usr"),
  nombre: "Martina",
  apellido: "Sosa",
  nombreUsuario: "martina.sosa",
  email: mediosEmail,
  passwordHash: mediosPasswordHash,
  tipo: "medios",
  profile: {
    bio: "Directora y guionista. Busco pasantía en producción audiovisual.",
    year: 4,
    specialty: "Dirección y guion",
    phone: null,
    tools: ["Premiere", "Audition"],
    experiences: [
      { id: createId("exp"), year: 2025, position: "Directora y guionista", place: "Lo que queda" },
    ],
    cv: null,
  },
  createdAt: now,
  updatedAt: now,
};
const outsiderUser: UserDocument = {
  id: createId("usr"),
  nombre: "Lucía",
  apellido: "Pérez",
  nombreUsuario: "lucia.perez",
  email: outsiderEmail,
  passwordHash: outsiderPasswordHash,
  tipo: "outsider",
  profile: {
    bio: "",
    year: null,
    specialty: "",
    phone: null,
    tools: [],
    experiences: [],
    cv: null,
  },
  createdAt: now,
  updatedAt: now,
};

const seeded = await store.update((state) => {
  let medios = state.users.find((user) => user.email === mediosEmail);
  if (!medios) {
    medios = mediosUser;
    state.users.push(medios);
  }
  medios.tipo = "medios";
  medios.passwordHash = mediosPasswordHash;
  let outsider = state.users.find((user) => user.email === outsiderEmail);
  if (!outsider) {
    outsider = outsiderUser;
    state.users.push(outsider);
  }
  outsider.tipo = "outsider";
  outsider.passwordHash = outsiderPasswordHash;

  const projectDefinitions = [
    {
      titulo: "Lo que queda",
      tipo: "Cortometraje",
      anio: 2025,
      genero: "Drama",
      duracionMinutos: 14,
      descripcion: "Una familia se reúne para decidir qué hacer con una herencia inesperada.",
      url: "https://example.com/lo-que-queda",
    },
    {
      titulo: "Ruido blanco",
      tipo: "Podcast y radio",
      anio: 2024,
      genero: "Suspenso",
      duracionMinutos: 22,
      descripcion: "Un programa de radio recibe una llamada que nadie recuerda haber atendido.",
      url: "https://example.com/ruido-blanco",
    },
  ] as const;

  const projects = projectDefinitions.map((definition) => {
    let project = state.projects.find(
      (item) => item.titulo === definition.titulo && item.publicadoPor === medios.id,
    );
    if (!project) {
      project = {
        ...definition,
        id: createId("prj"),
        imagen: null,
        coverFile: null,
        publicadoPor: medios.id,
        equipo: [{ userId: medios.id, roles: ["Autor"], comment: "" }],
        views: 0,
        createdAt: now,
        updatedAt: now,
      } satisfies ProjectDocument;
      state.projects.push(project);
    }
    return project;
  });

  const firstProject = projects[0];
  if (firstProject) {
    if (!state.reviews.some((review) => review.projectId === firstProject.id && review.userId === outsider.id)) {
      state.reviews.push({
        id: createId("rev"),
        projectId: firstProject.id,
        userId: outsider.id,
        value: 5,
        text: "Me gustó mucho la historia y el trabajo del equipo.",
        createdAt: now,
        updatedAt: now,
      });
    }
    if (!state.ratings.some((rating) => rating.projectId === firstProject.id && rating.userId === outsider.id)) {
      state.ratings.push({
        projectId: firstProject.id,
        userId: outsider.id,
        value: 5,
        updatedAt: now,
      });
    }
    if (!state.favorites.some((favorite) => favorite.projectId === firstProject.id && favorite.userId === outsider.id)) {
      state.favorites.push({ projectId: firstProject.id, userId: outsider.id, createdAt: now });
    }
  }
  return { medios, outsider, projects };
});

console.info("Datos de ejemplo cargados o actualizados (sin duplicar usuarios ni proyectos).");
console.info(`Cuenta Medios: ${seeded.medios.nombreUsuario} (${mediosEmail})`);
console.info(`Cuenta Outsider: ${seeded.outsider.nombreUsuario} (${outsiderEmail})`);
console.info("Ambas cuentas usan la contraseña indicada en SEED_PASSWORD.");
