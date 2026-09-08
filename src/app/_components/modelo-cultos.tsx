"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { modeloCultoSchema, ModeloCultoSchema, funcaoTemplateSchema, FuncaoTemplateSchema } from "../_schemas/auth-schemas";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import styles from "./modelo-cultos.module.css";

type Modelo = { id: string; nome: string; ministerio_id: string };
type Ministerio = { id: string; ministerio: string };
type FuncaoModelo = { id: string; funcao: string; quantidade: number };

export default function GerenciarTemplates() {
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [ministerios, setMinisterios] = useState<Ministerio[]>([]);
  const [ministerioFiltro, setMinisterioFiltro] = useState<string>("");
  const [modeloSelecionado, setModeloSelecionado] = useState<string | null>(null);
  const [funcoes, setFuncoes] = useState<FuncaoModelo[]>([]);

  const formModelo = useForm<ModeloCultoSchema>({ resolver: zodResolver(modeloCultoSchema) });
  const formFuncao = useForm<FuncaoTemplateSchema>({ resolver: zodResolver(funcaoTemplateSchema) });

  useEffect(() => {
    carregarModelos();
    carregarMinisterios();
  }, []);

  useEffect(() => {
    if (modeloSelecionado) carregarFuncoes(modeloSelecionado);
  }, [modeloSelecionado]);

  async function carregarModelos() {
    const { data } = await supabase.from("modelos_culto").select("id, nome, ministerio_id").order("nome");
    setModelos(data ?? []);
  }

  async function carregarMinisterios() {
    const { data } = await supabase.from("ministerios").select("id, ministerio").order("ministerio");
    setMinisterios(data ?? []);
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
      .insert([{ nome: data.nome, ministerio_id: data.ministerio_id }])
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

  async function removerModelo(id: string) {
    const confirmar = window.confirm("Remover este template? As funções associadas a ele também serão removidas.");
    if (!confirmar) return;

    await supabase.from("modelos_culto_funcao").delete().eq("modelo_culto_id", id);
    await supabase.from("modelos_culto").delete().eq("id", id);

    if (modeloSelecionado === id) {
      setModeloSelecionado(null);
      setFuncoes([]);
    }

    await carregarModelos();
  }

  function nomeMinisterio(id: string) {
    return ministerios.find((m) => String(m.id) === String(id))?.ministerio ?? "?";
  }

  const modelosFiltrados = ministerioFiltro
    ? modelos.filter((m) => String(m.ministerio_id) === String(ministerioFiltro))
    : modelos;

  return (
    <div className={styles.pagina}>
      <div className={styles.forms}>
        <p className={styles.titulo}>Templates de culto</p>

        <form onSubmit={formModelo.handleSubmit(criarModelo)}>
          <input type="text" placeholder="Nome do template (ex: Domingo Manhã)" {...formModelo.register("nome")} />
          {formModelo.formState.errors.nome && <span>{formModelo.formState.errors.nome.message}</span>}

          <select {...formModelo.register("ministerio_id")}>
            <option value="">Selecione o ministério</option>
            {ministerios.map((m) => (
              <option key={m.id} value={m.id}>{m.ministerio}</option>
            ))}
          </select>
          {formModelo.formState.errors.ministerio_id && <span>{formModelo.formState.errors.ministerio_id.message}</span>}

          <button className={styles.botaoPrincipal} type="submit">Criar template</button>
        </form>

        <div>
          <h3 className={styles.subtitulo}>Templates existentes</h3>

          <select value={ministerioFiltro} onChange={(e) => setMinisterioFiltro(e.target.value)}>
            <option value="">Todos os ministérios</option>
            {ministerios.map((m) => (
              <option key={m.id} value={m.id}>{m.ministerio}</option>
            ))}
          </select>

          <ul>
            {modelosFiltrados.map((m) => (
              <li key={m.id} className={styles.listaCulto}>
                <span
                  onClick={() => setModeloSelecionado(m.id)}
                  style={{ cursor: "pointer", fontWeight: modeloSelecionado === m.id ? 700 : 400 }}
                >
                  {m.nome} — {nomeMinisterio(m.ministerio_id)}
                  {modeloSelecionado === m.id && " (selecionado)"}
                </span>
                <Button type="button" variant="destructive" onClick={() => removerModelo(m.id)}>
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        </div>

        {modeloSelecionado && (
          <div>
            <h3 className={styles.subtitulo}>Funções do template</h3>

            <form onSubmit={formFuncao.handleSubmit(adicionarFuncao)}>
              <input type="text" placeholder="Função (ex: guitarrista)" {...formFuncao.register("funcao")} />
              <input type="number" placeholder="Quantidade" {...formFuncao.register("quantidade", { valueAsNumber: true })} />
              <button className={styles.botaoPrincipal} type="submit">Adicionar</button>
            </form>

            <ul>
              {funcoes.map((f) => (
                <li key={f.id} className={styles.listaCulto}>
                  <span>{f.funcao} — {f.quantidade} vaga(s)</span>
                  <Button type="button" variant="destructive" onClick={() => removerFuncao(f.id)}>
                    Remover
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}