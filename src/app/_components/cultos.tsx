"use client";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import {useForm} from "react-hook-form";
import { cultoSchema, signUpFormSchema, SignUpFormSchema } from "../_schemas/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import NazaLogo from "@/components/pas-nazareno.png"
import { supabase } from "@/lib/supabase";
import "./cultos.css"
import { useEffect, useState } from "react";
import imagemFundo from "@/components/ui/IMG_6545.jpg"
import imagemMinistry from "../../components/ui/IMG_6960-removebg-preview.png"
type FormData = {
    dia: string;
}

type Culto = {
  id: number;
  dia: string;
  descricao: string | null;
};



export default function Cultos() {

    const [cultos, setCultos] = useState<Culto[]>([]);

    const {register, handleSubmit, formState: {errors}} = useForm<cultoSchema>({resolver: zodResolver(cultoSchema),
    
        });


async function carregarCultos() {
  const { data, error } = await supabase
    .from("cultos")
    .select("*")
    .order("dia", { ascending: true });

    console.log("DATA", data)
    console.log("ERROR", error)

  if (error) {
    console.error(error);
    return;
  }

  setCultos(data ?? []);
}


async function onSubmit(data: cultoSchema) {

    const { error: insertError } = await supabase
    .from("cultos")
    .insert([
      {
        dia: data.dia,
        descricao: data.descricao || null,
      },
    ]);

  if (insertError) {
    console.error(insertError);
    return;
  }

  await carregarCultos();

}

useEffect(() => {
  carregarCultos();
}, []);



return(
  <>
      <header>
        <div className="logoministry"><img src={imagemMinistry.src}/></div>
        <a href="/atribuir-ministerio">Atribuir</a>
        <a href="/gerar-escala">Escala</a>
        <a href="/ministerios">Ministério</a>
        <a href="/modelos-cultos">Modelos</a>
        <a href="/vagas-culto">Vagas</a>
        <a href="/disponibilidade">Disponivel</a>
        <a href="/tabela">Tabela</a>
      </header>

   
    <div className="forms">

            <p className="titulo">Criar Cultos</p>
            <form onSubmit={handleSubmit(onSubmit)}>

                <div>
                    <input type="date" {...register("dia")} />
                    {errors?.dia && <span>{errors.dia.message}</span>}
                </div>

                <div>
                    <input type="text" placeholder="Descrição (opcional)" {...register("descricao")} />
                    {errors?.descricao && <span>{errors.descricao.message}</span>}
               </div>

                <button>Criar</button>

            </form>

    <div className="cultos-criados">
    <h2 className="culto-cad">Cultos cadastrados</h2>

    {cultos.length === 0 ? (
        <p>Nenhum culto cadastrado.</p>
    ) : (
        <ul className="lista-c">
        {cultos.map((culto) => (
            <li key={culto.id} className="lista-culto">
            {new Date(culto.dia + "T00:00:00").toLocaleDateString("pt-BR")}
            {culto.descricao && `- ${culto.descricao}`}
        </li>
      ))}
    </ul>
        )}
    </div>
 
       

        </div>
</>
)}


