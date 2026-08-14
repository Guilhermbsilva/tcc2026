"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vincularMinisterioSchema, VincularMinisterioSchema } from "../_schemas/auth-schemas";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import imagemFundo from "@/components/ui/IMG_6545.jpg"
import imagemMinistry from "../../components/ui/IMG_6960-removebg-preview.png"
import "./atribuir-ministerio.css"

type Usuario = { id: string; nome: string };
type Ministerio = { id: string; ministerio: string };
type Vinculo = {
  id: string;
  funcao: string;
  usuario: { nome: string } | null;
  ministerios: { ministerio: string } | null;
};

export default function AtribuirMinisterio() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [ministerios, setMinisterios] = useState<Ministerio[]>([]);
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<VincularMinisterioSchema>({
    resolver: zodResolver(vincularMinisterioSchema),
  });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const { data: usuariosData } = await supabase
      .from("usuario")
      .select("id, nome")
      .order("nome", { ascending: true });

    setUsuarios(usuariosData ?? []);

    const { data: ministeriosData } = await supabase
      .from("ministerios")
      .select("id, ministerio")
      .order("ministerio", { ascending: true });

    setMinisterios(ministeriosData ?? []);

    await carregarVinculos();
  }

  async function carregarVinculos() {
    const { data, error } = await supabase
      .from("usuario_ministerio")
      .select("id, funcao, usuario(nome), ministerios(ministerio)");

    if (error) {
      console.error(error);
      return;
    }

    setVinculos((data as any) ?? []);
  }

  async function onSubmit(data: VincularMinisterioSchema) {
    setMensagem(null);

    const { error } = await supabase
      .from("usuario_ministerio")
      .insert([
        {
          usuario_id: data.usuario_id,
          ministerio_id: data.ministerio_id,
          funcao: data.funcao,
        },
      ]);

    if (error) {
      console.error(error);
      setMensagem("Erro ao vincular. Verifique se esse vínculo já existe.");
      return;
    }

    setMensagem("Vínculo criado com sucesso!");
    reset();
    await carregarVinculos();
  }

async function remover(id: string) {
  console.log("tentando remover id:", id, typeof id);

  const { data, error, count } = await supabase
    .from("usuario_ministerio")
    .delete()
    .eq("id", id)
    .select(); // isso faz o Supabase retornar as linhas que foram de fato deletadas

  console.log("resultado:", { data, error });

  if (error) {
    console.error(error);
    return;
  }

  await carregarVinculos();
}

  return (
<>
       <header>
            <div className="logoministry"><img src={imagemMinistry.src}/></div>
            <a href="/cultos">Cultos</a>
            <a href="/gerar-escala">Escala</a>
            <a href="/ministerio">Ministério</a>
            <a href="/modelos-cultos">Modelos</a>
            <a href="/vagas-culto">Vagas</a>
            <a href="/disponibilidade">Disponivel</a>
            <a href="/tabela">Tabelas</a>
          </header>
    
    <div className="forms">
      <p className="titulo">Atribuir Ministério</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <select {...register("usuario_id")}>
            <option value="">Selecione o usuário</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>{u.nome}</option>
            ))}
          </select>
          {errors?.usuario_id && <span>{errors.usuario_id.message}</span>}
        </div>

        <div>
          <select {...register("ministerio_id")}>
            <option value="">Selecione o ministério</option>
            {ministerios.map((m) => (
              <option key={m.id} value={m.id}>{m.ministerio}</option>
            ))}
          </select>
          {errors?.ministerio_id && <span>{errors.ministerio_id.message}</span>}
        </div>

        <div>
          <h2>Função:</h2>
          <input type="text" placeholder="(ex: guitarrista, cantor)" {...register("funcao")} />
          {errors?.funcao && <span>{errors.funcao.message}</span>}
        </div>

        <Button type="submit">Atribuir</Button>
      </form>

      {mensagem && <p>{mensagem}</p>}

      <div className="cultos-criados">
        <h2 className="culto-cad">Atribuições:</h2>

        {vinculos.length === 0 ? (
          <p>Nenhum vínculo cadastrado.</p>
        ) : (
          <ul className="lista-c">
            {vinculos.map((v) => (
              <li key={v.id} className="lista-culto">
                {v.usuario?.nome} — {v.ministerios?.ministerio} ({v.funcao})
                <Button type="button" variant="destructive" onClick={() => remover(v.id)}>
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