"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { funcaoTemplateSchema, FuncaoTemplateSchema } from "../_schemas/auth-schemas";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import "./vagas-culto.css"
import imagemFundo from "@/components/ui/IMG_6545.jpg"
import imagemMinistry from "../../components/ui/IMG_6960-removebg-preview.png"

type Culto = { id: string; dia: string; descricao: string | null };
type Modelo = { id: string; nome: string };
type VagaCulto = { id: string; funcao: string; quantidade: number };

export default function VagasCulto() {
  const [cultos, setCultos] = useState<Culto[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [cultoSelecionado, setCultoSelecionado] = useState<string>("");
  const [vagas, setVagas] = useState<VagaCulto[]>([]);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FuncaoTemplateSchema>({
    resolver: zodResolver(funcaoTemplateSchema),
  });

  useEffect(() => {
    carregarOpcoes();
  }, []);

  useEffect(() => {
    if (cultoSelecionado) carregarVagas(cultoSelecionado);
  }, [cultoSelecionado]);

  async function carregarOpcoes() {
    const { data: cultosData } = await supabase.from("cultos").select("id, dia, descricao").order("dia");
    setCultos(cultosData ?? []);

    const { data: modelosData } = await supabase.from("modelos_culto").select("id, nome").order("nome");
    setModelos(modelosData ?? []);
  }

  async function carregarVagas(cultoId: string) {
    const { data } = await supabase
      .from("cultos_funcao")
      .select("id, funcao, quantidade")
      .eq("culto_id", cultoId);
    setVagas(data ?? []);
  }

  async function aplicarTemplate(modeloId: string) {
    if (!cultoSelecionado || !modeloId) return;

    const { data: funcoesModelo } = await supabase
      .from("modelos_culto_funcao")
      .select("funcao, quantidade")
      .eq("modelo_culto_id", modeloId);

    if (!funcoesModelo || funcoesModelo.length === 0) return;

    const registros = funcoesModelo.map((f) => ({
      culto_id: cultoSelecionado,
      funcao: f.funcao,
      quantidade: f.quantidade,
    }));

    const { error } = await supabase.from("cultos_funcao").insert(registros);

    if (error) {
      console.error(error);
      setMensagem("Erro ao aplicar template (talvez já existam vagas com essas funções nesse culto).");
      return;
    }

    setMensagem("Template aplicado!");
    await carregarVagas(cultoSelecionado);
  }

  async function adicionarFuncaoManual(data: FuncaoTemplateSchema) {
    if (!cultoSelecionado) return;

    const { error } = await supabase
      .from("cultos_funcao")
      .insert([{ culto_id: cultoSelecionado, funcao: data.funcao, quantidade: data.quantidade }]);

    if (error) {
      console.error(error);
      setMensagem("Erro ao adicionar função.");
      return;
    }

    reset();
    await carregarVagas(cultoSelecionado);
  }

  async function removerVaga(id: string) {
    await supabase.from("cultos_funcao").delete().eq("id", id);
    if (cultoSelecionado) await carregarVagas(cultoSelecionado);
  }

  return (
    <>
    <div className="container">
      <header>
        <div className="logoministry"><img src={imagemMinistry.src}/></div>
        <a href="/atribuir-ministerio">Atribuir</a>
        <a href="/cultos">Cultos</a>
        <a href="/gerar-escala">Escala</a>
        <a href="/ministerios">Ministério</a>
        <a href="/modelos-cultos">Modelos</a>
        <a href="/disponibilidade">Disponivel</a>
        <a href="/tabela">Tabela</a>
      </header>

    <div className="forms">
      <p className="titulo">Vagas Disponiveis</p>

      <select value={cultoSelecionado} onChange={(e) => setCultoSelecionado(e.target.value)}>
        <option value="">Selecione o culto</option>
        {cultos.map((c) => (
          <option key={c.id} value={c.id}>
            {new Date(c.dia + "T00:00:00").toLocaleDateString("pt-BR")}
            {c.descricao && ` — ${c.descricao}`}
          </option>
        ))}
      </select>

      {cultoSelecionado && (
        <>
          <div>
            <label>Aplicar template: </label>
            <select onChange={(e) => e.target.value && aplicarTemplate(e.target.value)} defaultValue="">
              <option value="">Selecione...</option>
              {modelos.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSubmit(adicionarFuncaoManual)}>
            <input type="text" placeholder="Função (ex: guitarrista)" {...register("funcao")} />
            {errors?.funcao && <span>{errors.funcao.message}</span>}
            <input type="number" placeholder="Quantidade" {...register("quantidade", { valueAsNumber: true })}/>
            <Button type="submit">Adicionar função</Button>
          </form>

          {mensagem && <p>{mensagem}</p>}

          <div className="cultos-criados">
            <h2 className="culto-cad">Vagas definidas</h2>
            {vagas.length === 0 ? (
              <p>Nenhuma vaga definida ainda.</p>
            ) : (
              <ul className="lista-c">
                {vagas.map((v) => (
                  <li key={v.id} className="lista-culto">
                    {v.funcao} — {v.quantidade} vaga(s)
                    <Button type="button" variant="destructive" onClick={() => removerVaga(v.id)}>Remover</Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
    </div>
    </>
  );
}