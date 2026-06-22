import { z } from "zod";
import {
  displayNameSchema,
  emailSchema,
  passwordSchema,
} from "@/lib/validation/common";

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    displayName: displayNameSchema,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password").max(72),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const resetRequestSchema = z.object({ email: emailSchema });
export type ResetRequestInput = z.infer<typeof resetRequestSchema>;

export const updatePasswordSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
