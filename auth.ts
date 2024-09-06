import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { signInSchema } from "./lib/zod";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Credentials({
        credentials:{
            email:{label:'Email', type:"email", placeholder:"Email"},
            password:{label:'Senha', type:"Password", placeholder:"Senha"}
        },
        async authorize(credentials){

            let user = null

            const parseCredentials = signInSchema.safeParse(credentials);
            if(!parseCredentials.success){
                console.error("Credencial inválida", parseCredentials.error.errors)
                return null
            }

            user = {
                id:"1",
                name:"jpnc",
                password:"jpnc@email.com",
                role:"admin"
                
            }

            if(!parseCredentials.success){
                console.log("Credencial Inválida")
                return null
            }

            return user
        }
    })
  ],

  callbacks:{
    authorized({request:{nextUrl},auth}){
        const isLoggedIn = !!auth?.user;
        const {pathname} = nextUrl;
        const role = auth?.user?.role || "user";

        if(pathname.startsWith("/auth/signin") && isLoggedIn){
            return Response.redirect(new URL('/', nextUrl))
        }

        if(pathname.startsWith("/page2") && role !== "admin"){
            return Response.redirect(new URL("/", nextUrl))
        }

        return !!auth;
    },

    jwt({token, user, trigger, session}){
        if(user){
            token.id = user.id as string;
            token.role = user.role as string;
        }

        if(trigger === "update" && session){
            token = {...token, ...session}
        }
        return token;
    },
    session({session, token}){
        session.user.id = token.id;
        session.user.role = token.role;
        return session
    }
  },

  pages:{
    signIn:"/auth/signin"
  }
});
