import { z } from "zod";
import { ROLES } from "../../domain/auth";

export const userRoleSchema = z.enum(ROLES);

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: userRoleSchema,
  authRequise: z.boolean().optional(),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.union([z.number(), z.string()]),
  utilisateur: userSchema,
});

export const refreshResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.union([z.number(), z.string()]),
});

export const meResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: userRoleSchema,
  authRequise: z.boolean().optional(),
});

export const bookSchema = z.object({
  id: z.string(),
  titre: z.string(),
  auteur: z.string(),
  editeur: z.string(),
  annee: z.number(),
  lu: z.boolean(),
  favori: z.boolean(),
  note: z.number().nullable(),
  couverture: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number(),
});

export const paginatedBooksSchema = z.object({
  items: z.array(bookSchema),
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const bookNoteSchema = z.object({
  id: z.string(),
  livreId: z.string(),
  contenu: z.string(),
  createdAt: z.string(),
});
export const bookFormSchema = z.object({
  titre: z.string(),
  auteur: z.string(),
  editeur: z.string(),
  annee: z.number(),
  lu: z.boolean(),
  favori: z.boolean(),
  note: z.number().nullable(),
  couverture: z.string().nullable(),
});

export const bookNotesSchema = z.array(bookNoteSchema);
