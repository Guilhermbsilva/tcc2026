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
type Modelo = { id: string; nome: string; ministerio_id: string };
type Ministerio = { id: string; ministerio: string };
type VagaCulto = { id: string; funcao: string; quantidade: number; ministerio_id: string };

export default function VagasCulto() {
  const [cultos, setCultos] = useState<Culto[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [ministerios, setMinisterios] = useState<Ministerio[]>([]);
  const [cultoSelecionado, setCultoSelecionado] = useState<string>("");
  const [ministerioSelecionado, setMinisterioSelecionado] = useState<string>("");
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

    const { data: modelosData } = await supabase
    .from("modelos_culto")
    .select("id, nome, ministerio_id")
    .order("nome");
    setModelos(modelosData ?? []);

    const { data: ministeriosData } = await supabase.from("ministerios").select("id, ministerio").order("ministerio");
    setMinisterios(ministeriosData ?? []);
  }

  async function carregarVagas(cultoId: string) {
    const { data } = await supabase
      .from("cultos_funcao")
      .select("id, funcao, quantidade, ministerio_id")
      .eq("culto_id", cultoId);
    setVagas(data ?? []);
  }

  async function aplicarTemplate(modeloId: string) {
    if (!cultoSelecionado || !modeloId || !ministerioSelecionado) {
      setMensagem("Selecione o ministério antes de aplicar um template.");
      return;
    }

    const { data: funcoesModelo } = await supabase
      .from("modelos_culto_funcao")
      .select("funcao, quantidade")
      .eq("modelo_culto_id", modeloId);

    if (!funcoesModelo || funcoesModelo.length === 0) return;

    const registros = funcoesModelo.map((f) => ({
      culto_id: cultoSelecionado,
      ministerio_id: ministerioSelecionado,
      funcao: f.funcao,
      quantidade: f.quantidade,
    }));

    const { error } = await supabase.from("cultos_funcao").insert(registros);

    if (error) {
      console.error(error);
      setMensagem("Erro ao aplicar template (talvez já existam vagas com essas funções nesse culto/ministério).");
      return;
    }

    setMensagem("Template aplicado!");
    await carregarVagas(cultoSelecionado);
  }

  async function adicionarFuncaoManual(data: FuncaoTemplateSchema) {
    if (!cultoSelecionado) return;

    if (!ministerioSelecionado) {
      setMensagem("Selecione o ministério antes de adicionar a função.");
      return;
    }

    const { error } = await supabase
      .from("cultos_funcao")
      .insert([{
        culto_id: cultoSelecionado,
        ministerio_id: ministerioSelecionado,
        funcao: data.funcao,
        quantidade: data.quantidade,
      }]);

    if (error) {
      console.error(error);
      setMensagem("Erro ao adicionar função.");
      return;
    }

    setMensagem(null);
    reset();
    await carregarVagas(cultoSelecionado);
  }

  async function removerVaga(id: string) {
    await supabase.from("cultos_funcao").delete().eq("id", id);
    if (cultoSelecionado) await carregarVagas(cultoSelecionado);
  }

  // filtra a lista pra mostrar só as vagas do ministério selecionado
const vagasFiltradas = ministerioSelecionado
  ? vagas.filter((v) => String(v.ministerio_id) === String(ministerioSelecionado))
  : vagas;

function nomeMinisterio(id: string) {
  return ministerios.find((m) => String(m.id) === String(id))?.ministerio ?? "?";
}

  return (
    <>
    <div className="container">
      <header>
        <div className="logoministry"><img src={imagemMinistry.src}/></div>
        <a href="/atribuir-ministerio">Atribuir</a>
        <a href="/cultos">Cultos</a>
        <a href="/gerar-escala">Gerar Escala</a>
        <a href="/ministerios">Ministério</a>
        <a href="/modelos-culto">Modelos</a>
        <a href="/disponibilidade">Disponivel</a>
        <a href="/inicio">Tabela</a>
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
          <select value={ministerioSelecionado} onChange={(e) => setMinisterioSelecionado(e.target.value)}>
            <option value="">Selecione o ministério</option>
            {ministerios.map((m) => (
              <option key={m.id} value={m.id}>{m.ministerio}</option>
            ))}
          </select>

          {ministerioSelecionado && (
            <>
              <div>
                <label>Aplicar template: </label>
                <select onChange={(e) => e.target.value && aplicarTemplate(e.target.value)} defaultValue="">
                  <option value="">Selecione...</option>
                      {modelos
                        .filter((m) => String(m.ministerio_id) === String(ministerioSelecionado))
                        .map((m) => (
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
                <h2 className="culto-cad">Vagas definidas — {nomeMinisterio(ministerioSelecionado)}</h2>
                {vagasFiltradas.length === 0 ? (
                  <p>Nenhuma vaga definida ainda para esse ministério.</p>
                ) : (
                  <ul className="lista-c">
                    {vagasFiltradas.map((v) => (
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
        </>
      )}
    </div>
    </div>
    </>
  );
}