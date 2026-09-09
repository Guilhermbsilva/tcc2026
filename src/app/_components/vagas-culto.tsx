"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { funcaoTemplateSchema, FuncaoTemplateSchema } from "../_schemas/auth-schemas";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import styles from "./vagas-culto.module.css";
import Spinner from "./spinner";

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
  const [aplicandoTemplate, setAplicandoTemplate] = useState(false);
  const [salvandoFuncao, setSalvandoFuncao] = useState(false);
  const [removendoId, setRemovendoId] = useState<string | null>(null);

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

    setAplicandoTemplate(true);

    const { data: funcoesModelo } = await supabase
      .from("modelos_culto_funcao")
      .select("funcao, quantidade")
      .eq("modelo_culto_id", modeloId);

    if (!funcoesModelo || funcoesModelo.length === 0) {
      setAplicandoTemplate(false);
      return;
    }

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
      setAplicandoTemplate(false);
      return;
    }

    setMensagem("Template aplicado!");
    await carregarVagas(cultoSelecionado);
    setAplicandoTemplate(false);
  }

  async function adicionarFuncaoManual(data: FuncaoTemplateSchema) {
    if (!cultoSelecionado) return;

    if (!ministerioSelecionado) {
      setMensagem("Selecione o ministério antes de adicionar a função.");
      return;
    }

    setSalvandoFuncao(true);

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
      setSalvandoFuncao(false);
      return;
    }

    setMensagem(null);
    reset();
    await carregarVagas(cultoSelecionado);
    setSalvandoFuncao(false);
  }

  async function removerVaga(id: string) {
    setRemovendoId(id);
    await supabase.from("cultos_funcao").delete().eq("id", id);
    if (cultoSelecionado) await carregarVagas(cultoSelecionado);
    setRemovendoId(null);
  }

  const vagasFiltradas = ministerioSelecionado
    ? vagas.filter((v) => String(v.ministerio_id) === String(ministerioSelecionado))
    : vagas;

  function nomeMinisterio(id: string) {
    return ministerios.find((m) => String(m.id) === String(id))?.ministerio ?? "?";
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.conteudo}>
        <div className={`${styles.card} ${styles.cardCriar}`}>
          <p className={styles.titulo}>Vagas do Culto</p>

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
                  <select
                    onChange={(e) => e.target.value && aplicarTemplate(e.target.value)}
                    defaultValue=""
                    disabled={aplicandoTemplate}
                  >
                    <option value="">
                      {aplicandoTemplate ? "Aplicando..." : "Aplicar template..."}
                    </option>
                    {modelos
                      .filter((m) => String(m.ministerio_id) === String(ministerioSelecionado))
                      .map((m) => (
                        <option key={m.id} value={m.id}>{m.nome}</option>
                      ))}
                  </select>

                  <form onSubmit={handleSubmit(adicionarFuncaoManual)}>
                    <input type="text" placeholder="Função (ex: guitarrista)" {...register("funcao")} disabled={salvandoFuncao} />
                    {errors?.funcao && <span>{errors.funcao.message}</span>}
                    <input type="number" placeholder="Quantidade" {...register("quantidade", { valueAsNumber: true })} disabled={salvandoFuncao} />
                    <button className={styles.botaoPrincipal} type="submit" disabled={salvandoFuncao}>
                      {salvandoFuncao ? (<><Spinner /> Adicionando...</>) : "Adicionar função"}
                    </button>
                  </form>

                  {mensagem && <p>{mensagem}</p>}
                </>
              )}
            </>
          )}
        </div>

        <div className={`${styles.card} ${styles.cardLista}`}>
          <p className={styles.titulo}>
            {ministerioSelecionado ? `Vagas — ${nomeMinisterio(ministerioSelecionado)}` : "Vagas definidas"}
          </p>

          {!cultoSelecionado ? (
            <p className={styles.vazio}>Selecione um culto para ver as vagas.</p>
          ) : !ministerioSelecionado ? (
            <p className={styles.vazio}>Selecione um ministério para ver as vagas.</p>
          ) : vagasFiltradas.length === 0 ? (
            <p className={styles.vazio}>Nenhuma vaga definida ainda para esse ministério.</p>
          ) : (
            <ul className={styles.listaC}>
              {vagasFiltradas.map((v) => (
                <li key={v.id} className={styles.listaCulto}>
                  <span>{v.funcao} — {v.quantidade} vaga(s)</span>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removerVaga(v.id)}
                    disabled={removendoId === v.id}
                  >
                    {removendoId === v.id ? <Spinner /> : "Remover"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}