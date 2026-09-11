import { z } from "zod";

/**
 * Creates the login validation schema with localized error messages.
 */
export const createLoginSchema = (t?: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, {
        message: t ? t("auth.emailRequired") : "L'email est requis.",
      })
      .email({
        message: t
          ? t("auth.emailInvalid")
          : "Veuillez entrer une adresse email valide.",
      }),
    password: z.string().min(1, {
      message: t ? t("auth.passwordRequired") : "Le mot de passe est requis.",
    }),
  });

export const loginSchema = createLoginSchema();

export type LoginFormData = z.infer<typeof loginSchema>;
