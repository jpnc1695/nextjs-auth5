import { object, string } from "zod";

export const signInSchema = object({
  email: string({ required_error: "Email é obrigatório" })
    .min(1, "Email é obrigatório")
    .email("Email Inválido"),
  
 password: string({required_error:"Senha é obrigatório"})
    .min(1, "Senha é obrigatório")
    .min(8,"A senha dev ter mais de 8 caracteres")
    .max(32,"A senha deve ter menos que 32 caracteres")
});
