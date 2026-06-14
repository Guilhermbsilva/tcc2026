"use client";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import {useForm} from "react-hook-form";
import { signUpFormSchema, SignUpFormSchema } from "../_schemas/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import "./sign-up-form.css"
import NazaLogo from "@/components/pas-nazareno.png"
import { supabase } from "@/lib/supabase";

type FormData = {
    nome: string;
    email: string;
    senha: string;
}

export default function SignUpHookForm() {
    
    const {register, handleSubmit, formState: {errors}} = useForm<SignUpFormSchema>({resolver: zodResolver(signUpFormSchema),

    });

async function onSubmit(data: SignUpFormSchema) {
 /*  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (authError) {
    console.error(authError);
    return;
  } */

  const { error: insertError } = await supabase
    .from("usuario")
    .insert([
      {
        nome: data.name,
        email: data.email,
        cargo: data.cargo,
      },
    ]);

  if (insertError) {
    console.error(insertError);
    return;
  }
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
                <p className="titulo">Faça Cadastro</p>
                <p className="normal">Faça cadastro para acessar o sistema</p>
        <form onSubmit={handleSubmit(onSubmit)}>
        
            <div>
            <Input placeholder="Nome" {...register("name")}/>
        
                    {errors?.name && (
                <div className="text-red-500 text-xs">
                    {errors?.name?.message}
                </div>
                    )}
        
                </div>
        
            <div>
            <Input placeholder="email" type="email" {...register("email")}/>
        
                    {errors?.email && (
                <div className="text-red-500 text-xs">
                    {errors?.email?.message}
                </div>
                    )}
        
            </div>

            <div>
            <Input placeholder="cargo" {...register("cargo")}/>
        
                    {errors?.cargo && (
                <div className="text-red-500 text-xs">
                    {errors?.cargo?.message}
                </div>
                    )}
        
            </div>
        
            <div>
            <Input placeholder="Senha" type="password" {...register("password")} />
        
                    {errors?.password && (
                <div className="text-red-500 text-xs">
                    {errors?.password?.message}
                </div>
                     )}
        
            </div>
        
            <div>
            <Input placeholder="Confirmar Senha" type="password" {...register("confirmPassword")}/>
        
                    {errors?.confirmPassword && (
                <div className="text-red-500 text-xs">
                    {errors?.confirmPassword?.message}
                </div>
                    )}
        
                </div>
        
                <Button>cadastrar</Button>
        
        </form>
        </div>
        </>
        
    )
}