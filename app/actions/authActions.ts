"use server";

import { signIn, signOut } from "@/auth";
import { signUpSchema } from "@/lib/zod";

import { AuthError } from "next-auth";

import bcryptjs from "bcryptjs";
import prisma from "@/lib/prisma";

export async function handleCredentialsSignin({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            message: "Credencial Invalida ",
          };
        default:
          return {
            message: "Algo deu errado.",
          };
      }
    }
    throw error;
  }
}

export async function handleGithubSignin(){
    await signIn("github",{redirectTo:"/"})
}

export async function handleSignOut(){
    await signOut()
}

export async function handleSignUp({ name, email, password, confirmPassword }: {
  name: string,
  email: string,
  password: string,
  confirmPassword: string
}) {
  try {
      const parsedCredentials = signUpSchema.safeParse({ name, email, password, confirmPassword });
      if (!parsedCredentials.success) {
          return { success: false, message: "Dados inválidos" };
      }

      // check if the email is already taken
      const existingUser = await prisma.user.findUnique({
          where: {
              email,
          },
      });

      if (existingUser) {
          return { success: false, message: "Já existe uma conta com este Email" };
      }

      // hash the password
      const hashedPassword = await bcryptjs.hash(password, 10);
      await prisma.user.create({
          data: {
              name,
              email,
              password: hashedPassword,
          },
      });

      return { success: true, message: "Conta criada com sucesso" };
  } catch (error) {
      console.error("Erro na criação da conta", error);
      return { success: false, message: "AErro inesperado, por favor tente novamente." };
  }
}
