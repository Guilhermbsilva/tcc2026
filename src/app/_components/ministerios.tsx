"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ministerioSchema, MinisterioSchema } from "../_schemas/auth-schemas";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import "./ministerios.css"
import imagemFundo from "@/components/ui/IMG_6545.jpg"
import imagemMinistry from "../../components/ui/IMG_6960-removebg-preview.png"
type Ministerio = {
  id: string;
  ministerio: string;
  descricao: string | null;
};

export default function Ministerios() {
  const [ministerios, setMinisterios] = useState<Ministerio[]>([]);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MinisterioSchema>({
    resolver: zodResolver(ministerioSchema),
  });

  useEffect(() => {
    carregarMinisterios();
  }, []);

  async function carregarMinisterios() {
    const { data, error } = await supabase
      .from("ministerios")
      .select("*")
      .order("ministerio", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setMinisterios(data ?? []);
  }

  async function onSubmit(data: MinisterioSchema) {
    setMensagem(null);

    const { error } = await supabase
      .from("ministerios")
      .insert([{ ministerio: data.ministerio, descricao: data.descricao || null }]);

    if (error) {
      console.error(error);
      setMensagem("Erro ao criar ministério. Talvez já exista um com esse nome.");
      return;
    }

    setMensagem("Ministério criado com sucesso!");
    reset();
    await carregarMinisterios();
  }

  async function remover(id: string) {
    const { error } = await supabase.from("ministerios").delete().eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    await carregarMinisterios();
  }

  return (
    <>
    <header>
            <div className="logoministry"><img src={imagemMinistry.src}/></div>
            <a href="/atribuir-ministerio">Atribuir</a>
            <a href="/cultos">Cultos</a>
            <a href="/gerar-escala">Escala</a>
            <a href="/modelos-culto">Modelos</a>
            <a href="/vagas-culto">Vagas</a>
            <a href="/disponibilidade">Disponivel</a>
            <a href="/inicio">Tabela</a>
          </header>
    
    <div className="forms">
      <p className="titulo">Criar Ministérios</p>
   
      <form onSubmit={handleSubmit(onSubmit)}>
         <div className="pai">
        <div>
          <input type="text" placeholder="Nome do ministério (ex: música)" {...register("ministerio")} />
          {errors?.ministerio && <span>{errors.ministerio.message}</span>}
        </div>

        <div>
          <input type="text" placeholder="Descrição (opcional)" {...register("descricao")} />
          {errors?.descricao && <span>{errors.descricao.message}</span>}
        </div>
</div>
        <Button type="submit">Criar</Button>
      </form>

      {mensagem && <p>{mensagem}</p>}

      <div className="cultos-criados">
        <h2 className="culto-cad">Ministérios cadastrados</h2>

        {ministerios.length === 0 ? (
          <p>Nenhum ministério cadastrado.</p>
        ) : (
          <ul className="lista-c">
            {ministerios.map((m) => (
              <li key={m.id} className="lista-culto">
                {m.ministerio}
                {m.descricao && ` — ${m.descricao}`}
                <Button type="button" variant="destructive" onClick={() => remover(m.id)}>
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
    </>
  );
}