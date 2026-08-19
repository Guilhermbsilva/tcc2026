"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gerarEscalaSchema, GerarEscalaSchema } from "../_schemas/auth-schemas";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { gerarEscala } from "@/lib/gerar-escala";
import "./gerar-escala.css"
import imagemFundo from "@/components/ui/IMG_6545.jpg"
import imagemMinistry from "../../components/ui/IMG_6960-removebg-preview.png"

type Culto = { id: string; dia: string; descricao: string | null };
type Ministerio = { id: string; ministerio: string };

type Resultado = {
  escalados: { usuario_id: string; funcao: string }[];
  avisos: string[];
};

export default function GerarEscala() {
  const [cultos, setCultos] = useState<Culto[]>([]);
  const [ministerios, setMinisterios] = useState<Ministerio[]>([]);
  const [nomesUsuarios, setNomesUsuarios] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<GerarEscalaSchema>({
    resolver: zodResolver(gerarEscalaSchema),
  });

  useEffect(() => {
    carregarOpcoes();
  }, []);

  async function carregarOpcoes() {
    const { data: cultosData } = await supabase
      .from("cultos")
      .select("id, dia, descricao")
      .order("dia", { ascending: true });

    setCultos(cultosData ?? []);

    const { data: ministeriosData } = await supabase
      .from("ministerios")
      .select("id, ministerio")
      .order("ministerio", { ascending: true });

    setMinisterios(ministeriosData ?? []);
  }

  async function apagarEscalaExistente(cultoId: string, ministerioId: string) {
    const { data: escalaExistente } = await supabase
      .from("escalas")
      .select("id")
      .eq("culto_id", cultoId)
      .eq("ministerio_id", ministerioId)
      .maybeSingle();

    if (!escalaExistente) return;

    await supabase.from("escala_usuario").delete().eq("escala_id", escalaExistente.id);
    await supabase.from("escalas").delete().eq("id", escalaExistente.id);
  }

  async function onSubmit(data: GerarEscalaSchema) {
    setErro(null);
    setResultado(null);

    // verifica se já existe escala pra esse culto + ministério
    const { data: escalaExistente } = await supabase
      .from("escalas")
      .select("id")
      .eq("culto_id", data.culto_id)
      .eq("ministerio_id", data.ministerio_id)
      .maybeSingle();

    if (escalaExistente) {
      const confirmar = window.confirm(
        "Já existe uma escala gerada para esse culto e ministério. Deseja substituí-la por uma nova?"
      );
      if (!confirmar) return;
    }

    setGerando(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: usuarioAdmin } = await supabase
        .from("usuario")
        .select("id")
        .eq("email", user.email)
        .single();

      if (!usuarioAdmin) throw new Error("Usuário não encontrado");

      if (escalaExistente) {
        await apagarEscalaExistente(data.culto_id, data.ministerio_id);
      }

      const resultado = await gerarEscala(data.culto_id, data.ministerio_id, usuarioAdmin.id);

      // busca os nomes dos escalados pra exibir
      const idsUsuarios = resultado.escalados.map((e) => e.usuario_id);
      if (idsUsuarios.length > 0) {
        const { data: usuariosData } = await supabase
          .from("usuario")
          .select("id, nome")
          .in("id", idsUsuarios);

        const mapaNomes: Record<string, string> = {};
        (usuariosData ?? []).forEach((u) => {
          mapaNomes[u.id] = u.nome;
        });
        setNomesUsuarios(mapaNomes);
      }

      setResultado(resultado);
    } catch (e: any) {
      console.error(e);
      if (e.code === "23505") {
        setErro("Já existe uma escala para esse culto e ministério. Tente novamente para substituí-la.");
      } else {
        setErro(e.message ?? "Erro ao gerar escala.");
      }
    } finally {
      setGerando(false);
    }
  }

  return (
    <>
         <header>
        <div className="logoministry"><img src={imagemMinistry.src}/></div>
        <a href="/atribuir-ministerio">Atribuir</a>
        <a href="/cultos">Cultos</a>
        <a href="/ministerios">Ministério</a>
        <a href="/modelos-culto">Modelos</a>
        <a href="/vagas-culto">Vagas</a>
        <a href="/disponibilidade">Disponivel</a>
        <a href="/inicio">Tabela</a>
      </header>

    <div className="forms">
      <p className="titulo">Gerar escala</p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <div className="pai">
          <select {...register("culto_id")}>
            <option value="">Selecione o culto</option>
            {cultos.map((c) => (
              <option key={c.id} value={c.id}>
                {new Date(c.dia + "T00:00:00").toLocaleDateString("pt-BR")}
                {c.descricao && ` — ${c.descricao}`}
              </option>
            ))}
          </select>
          {errors?.culto_id && <span>{errors.culto_id.message}</span>}
        

        
          <select {...register("ministerio_id")}>
            <option value="">Selecione o ministério</option>
            {ministerios.map((m) => (
              <option key={m.id} value={m.id}>{m.ministerio}</option>
            ))}
          </select>
          {errors?.ministerio_id && <span>{errors.ministerio_id.message}</span>}
        </div>
</div>
        <Button type="submit" disabled={gerando}>
          {gerando ? "Gerando..." : "Gerar escala"}
        </Button>
      </form>

      {erro && <p className="text-red-500">{erro}</p>}

      {resultado && (
        <div className="cultos-criados">
          <h2 className="culto-cad">Escala gerada</h2>

          {resultado.avisos.length > 0 && (
            <div>
              {resultado.avisos.map((aviso, i) => (
                <p key={i} className="text-yellow-500">{aviso}</p>
              ))}
            </div>
          )}

          {resultado.escalados.length === 0 ? (
            <p>Nenhum escalado.</p>
          ) : (
            <ul className="lista-c">
              {resultado.escalados.map((e, i) => (
                <li key={i} className="lista-culto">
                  {nomesUsuarios[e.usuario_id] ?? e.usuario_id} — {e.funcao}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
    </>
  );
}