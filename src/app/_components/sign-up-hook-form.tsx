"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import {useForm} from "react-hook-form";
import { signUpFormSchema, SignUpFormSchema } from "../_schemas/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import "./sign-up-form.css"
import { supabase } from "@/lib/supabase";
import imagemMinistry from "../../components/ui/IMG_6960-removebg-preview.png"
import { useRouter } from "next/navigation";

type FormData = {
    nome: string;
    email: string;
    senha: string;
}

export default function SignUpHookForm() {
    const router = useRouter();
    const [cadastroError, setCadastroError] = useState<string | null>(null);
    const [cadastroSucesso, setCadastroSucesso] = useState(false);

    const {register, handleSubmit, formState: {errors}} = useForm<SignUpFormSchema>({resolver: zodResolver(signUpFormSchema),

    });

async function onSubmit(data: SignUpFormSchema) {
  setCadastroError(null);
  setCadastroSucesso(false);

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (authError) {
    console.error(authError);
    setCadastroError("Erro ao cadastrar. Tente novamente.");
    return;
  }

  // detecta email já cadastrado (identities vazio = usuário já existe)
  if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
    setCadastroError("Esse email já está cadastrado. Tente fazer login.");
    return;
  }

  const { error: insertError } = await supabase
    .from("usuario")
    .insert([
      {
        nome: data.name,
        email: data.email,
        cargo: "usuario",
        funcao_solicitada: data.funcaoSolicitada,
      },
    ]);

  if (insertError) {
    console.error(insertError);
    setCadastroError("Erro ao salvar seus dados. Tente novamente.");
    return;
  }

  setCadastroSucesso(true);
  router.push("/login")

}

    return(

        <>
        
         <div className="imagemfundo"><img src="/IMG_7461.png" alt="" /></div>
            
            <div className="forms">

                <div className="logoministry"><img src={imagemMinistry.src}/></div>

                  <div className="azul">
                <p className="titulo">Faça Cadastro</p>
                <p className="normal">Faça cadastro para acessar o sistema</p>
        <form onSubmit={handleSubmit(onSubmit)}>
        
            <div>
                <h2>Nome</h2>
            <Input placeholder="Nome" {...register("name")}/>
        
                    {errors?.name && (
                <div className="text-red-500 text-xs">
                    {errors?.name?.message}
                </div>
                    )}
        
                </div>
        
            <div>
                <h2>Email</h2>
            <Input placeholder="you@example.com" type="email" {...register("email")}/>
        
                    {errors?.email && (
                <div className="text-red-500 text-xs">
                    {errors?.email?.message}
                </div>
                    )}
        
            </div>

            <div>
                <h2>Sua função</h2>
            <Input placeholder="(ex: guitarrista, cantor)" type="text" {...register("funcaoSolicitada")} />
        
                    {errors?.funcaoSolicitada && (
                <div className="text-red-500 text-xs">
                    {errors?.funcaoSolicitada?.message}
                </div>
                    )}
        
            </div>
        
            <div>
                <h2>Senha</h2>
            <Input placeholder="••••••••" type="password" {...register("password")} />
        
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

                {cadastroError && (
                    <div className="text-red-500 text-xs">{cadastroError}</div>
                )}

                {cadastroSucesso && (
                    <div className="text-green-600 text-xs">Cadastro realizado com sucesso! Você já pode fazer login.</div>
                )}
        
                <Button>cadastrar</Button>
        <div className="final">
                <span>ou</span>
                <h3>Já tem uma conta?<a href="/login">Iniciar sessão </a></h3>
                </div>
            </form>
        </div>
</div>
        </>
        
    )
}