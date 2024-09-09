import { object, string } from "zod";

export const signInSchema = object({
  email: string({ required_error: "Email é obrigatório" })
    .min(1, "Email é obrigatório")
    .email("Email Inválido"),
  
 password: string({required_error:"Senha é obrigatório"})
    .min(1, "Senha é obrigatório")
    .min(8,"A senha deve ter mais de 8 caracteres")
    .max(32,"A senha deve ter menos que 32 caracteres")
});



export const signUpSchema = object({
  name: string({ required_error: "Nome é obrigatório" })
      .min(1, "Nome é obrigatório")
      .max(50, "Nomes devem ter menos de 50 caracteres."),
  email: string({ required_error: "Email é obrigatório" })
      .min(1, "Email é obrigatório" )
      .email("Email inválido"),
  password: string({ required_error: "Senha é obrigatório" })
      .min(1, "Senha é obrigatório")
      .min(8, "A senha deve ter mais de 8 caracteres")
      .max(32, "A senha deve ter menos que 32 caracteres"),
  confirmPassword: string({ required_error: "Confirme sua senha" })
      .min(1, "COnfirme sua senha")
      .min(8, "A senha deve ter mais de 8 caracteres")
      .max(32, "A senha deve ter menos que 32 caracteres"),
})
  .refine((data) => data.password === data.confirmPassword, {
      message: "As senhas não são iguais",
      path: ["confirmPassword"],
  });