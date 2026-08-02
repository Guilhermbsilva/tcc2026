"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import {useForm} from "react-hook-form";
import { SignInSchema, signUpFormSchema, SignUpFormSchema } from "../_schemas/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import "./sign-up-form.css"
import NazaLogo from "@/components/pas-nazareno.png"
import { supabase } from "@/lib/supabase";
import { signInSchema } from "../_schemas/auth-schemas"
import { useRouter } from "next/navigation";

type FormData = {
    nome: string;
    email: string;
    senha: string;
}

export default function Login() {
    const router = useRouter();
    const [loginError, setLoginError] = useState<string | null>(null);
    const {register, handleSubmit, formState: {errors}} = useForm<SignInSchema>({resolver: zodResolver(signInSchema),

    });

async function onSubmit(data: SignInSchema ) {

    setLoginError(null);

  const { data: authData, error: authError} = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password
  })
    
  if (authError) {
      if (authError.message === "Invalid login credentials") {
        setLoginError("Email ou senha incorretos");
      } else if (authError.message === "Email not confirmed") {
        setLoginError("Confirme seu email antes de fazer login");
      } else {
        setLoginError("Erro ao fazer login. Tente novamente.");
      }
      console.error(authError);
      return;
    }

    router.push("disponibilidade");
}

    return(

        <><header>

            <h1 className="titulo2">MinistryHub</h1>

            <li className="lista">
                <a href="" className="quem-somos">Quem somos?</a>
                <a href="" className="title-cadastrar">Cadastrar</a>
            </li>

        </header><div className='backgroundcontainer'>

                <div className='content'></div>
            </div>
            
            <div className="forms">


                <img src={NazaLogo.src} alt="" />
                <p className="titulo">Faça Login</p>
                <p className="normal">Faça Login para acessar o sistema</p>
        <form onSubmit={handleSubmit(onSubmit)}>
        
            <div>
            <Input placeholder="email" type="email" {...register("email")}/>
        
                    {errors?.email && (
                <div className="text-red-500 text-xs">
                    {errors?.email?.message}
                </div>
                    )}

            <Input placeholder="Senha" type="password" {...register("password")} />
        
                    {errors?.password && (
                <div className="text-red-500 text-xs">
                    {errors?.password?.message}
                </div>
                     )}

                {loginError && (
                <div className="text-red-500 text-xs">{loginError}</div>
                )}
        
            </div>
        
                <Button>cadastrar</Button>
        
        </form>
        </div>
        </>
        
    )
}
