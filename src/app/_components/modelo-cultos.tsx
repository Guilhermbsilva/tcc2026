"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { modeloCultoSchema, ModeloCultoSchema, funcaoTemplateSchema, FuncaoTemplateSchema } from "../_schemas/auth-schemas";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import "./geral.css";

type Modelo = { id: string; nome: string };
type FuncaoModelo = { id: string; funcao: string; quantidade: number };

export default function GerenciarTemplates() {
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [modeloSelecionado, setModeloSelecionado] = useState<string | null>(null);
  const [funcoes, setFuncoes] = useState<FuncaoModelo[]>([]);

  const formModelo = useForm<ModeloCultoSchema>({ resolver: zodResolver(modeloCultoSchema) });
  const formFuncao = useForm<FuncaoTemplateSchema>({ resolver: zodResolver(funcaoTemplateSchema) });

  useEffect(() => {
    carregarModelos();
  }, []);

  useEffect(() => {
    if (modeloSelecionado) carregarFuncoes(modeloSelecionado);
  }, [modeloSelecionado]);

  async function carregarModelos() {
    const { data } = await supabase.from("modelos_culto").select("id, nome").order("nome");
    setModelos(data ?? []);
  }

  async function carregarFuncoes(modeloId: string) {
    const { data } = await supabase
      .from("modelos_culto_funcao")
      .select("id, funcao, quantidade")
      .eq("modelo_culto_id", modeloId);
    setFuncoes(data ?? []);
  }

  async function criarModelo(data: ModeloCultoSchema) {
    const { data: novo, error } = await supabase
      .from("modelos_culto")
      .insert([{ nome: data.nome }])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    formModelo.reset();
    await carregarModelos();
    setModeloSelecionado(novo.id);
  }

  async function adicionarFuncao(data: FuncaoTemplateSchema) {
    if (!modeloSelecionado) return;

    const { error } = await supabase
      .from("modelos_culto_funcao")
      .insert([{ modelo_culto_id: modeloSelecionado, funcao: data.funcao, quantidade: data.quantidade }]);

    if (error) {
      console.error(error);
      return;
    }

    formFuncao.reset();
    await carregarFuncoes(modeloSelecionado);
  }

  async function removerFuncao(id: string) {
    await supabase.from("modelos_culto_funcao").delete().eq("id", id);
    if (modeloSelecionado) await carregarFuncoes(modeloSelecionado);
  }

  return (
    <div className="forms">
      <p className="titulo">Templates de culto</p>

      <form onSubmit={formModelo.handleSubmit(criarModelo)}>
        <input type="text" placeholder="Nome do template (ex: Domingo Manhã)" {...formModelo.register("nome")} />
        {formModelo.formState.errors.nome && <span>{formModelo.formState.errors.nome.message}</span>}
        <Button type="submit">Criar template</Button>
      </form>

      <div>
        <h3>Templates existentes</h3>
        <ul className="lista-c">
          {modelos.map((m) => (
            <li key={m.id} className="lista-culto">
              <button type="button" onClick={() => setModeloSelecionado(m.id)}>
                {m.nome} {modeloSelecionado === m.id && "(selecionado)"}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {modeloSelecionado && (
        <div>
          <h3>Funções do template</h3>

          <form onSubmit={formFuncao.handleSubmit(adicionarFuncao)}>
            <input type="text" placeholder="Função (ex: guitarrista)" {...formFuncao.register("funcao")} />
            <input type="number" placeholder="Quantidade" {...formFuncao.register("quantidade", { valueAsNumber: true })} />
            <Button type="submit">Adicionar</Button>
          </form>

          <ul className="lista-c">
            {funcoes.map((f) => (
              <li key={f.id} className="lista-culto">
                {f.funcao} — {f.quantidade} vaga(s)
                <Button type="button" variant="destructive" onClick={() => removerFuncao(f.id)}>Remover</Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}