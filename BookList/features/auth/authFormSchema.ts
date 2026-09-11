import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'email est requis." })
    .email({ message: "Veuillez entrer une adresse email valide." }),
  password: z.string().min(1, { message: "Le mot de passe est requis." }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
