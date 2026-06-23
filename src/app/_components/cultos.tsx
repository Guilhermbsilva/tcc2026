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

type FormData = {
    dia: string;
}

type Culto = {
    id: number;
  dia: string;
};



export default function cultos() {

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

    <><div className="backgroundcontainer">

        <div className="content"></div>

    </div><div className="forms">


            <p className="titulo">Criar Cultos</p>
            <form onSubmit={handleSubmit(onSubmit)}>

                <div>
                    <input type="date" {...register("dia")} />

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
            {new Date(culto.dia).toLocaleDateString("pt-BR")}
        </li>
      ))}
    </ul>
        )}
    </div>
 
       

        </div>


        </>

)}




