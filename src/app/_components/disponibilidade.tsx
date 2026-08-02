"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

type Culto = {
  id: string;
  dia: string;
  descricao: string | null;
};

type Ministerio = {
  id: string;
  ministerio: string;
};

// chave única = `${cultoId}-${ministerioId}`
export default function Disponibilidade() {
  const [cultos, setCultos] = useState<Culto[]>([]);
  const [ministerios, setMinisterios] = useState<Ministerio[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: usuario, error: usuarioError } = await supabase
      .from("usuario")
      .select("id")
      .eq("email", user.email)
      .single();

    if (usuarioError || !usuario) {
      console.error(usuarioError);
      return;
    }

    setUsuarioId(usuario.id);

    const { data: cultosData } = await supabase
      .from("cultos")
      .select("*")
      .order("dia", { ascending: true });

    setCultos(cultosData ?? []);

    const { data: ministeriosDoUsuario } = await supabase
      .from("usuario_ministerio")
      .select("ministerio_id, ministerios(id, ministerio)")
      .eq("usuario_id", usuario.id);

    const ministeriosFormatados = (ministeriosDoUsuario ?? []).map((m: any) => ({
      id: m.ministerios.id,
      ministerio: m.ministerios.ministerio,
    }));

    setMinisterios(ministeriosFormatados);

    const { data: disponibilidadesExistentes } = await supabase
      .from("disponibilidades")
      .select("culto_id, ministerio_id")
      .eq("usuario_id", usuario.id);

    const jaMarcados = new Set(
      (disponibilidadesExistentes ?? []).map((d) => `${d.culto_id}-${d.ministerio_id}`)
    );

    setSelecionados(jaMarcados);
    setCarregando(false);
  }

  function alternar(cultoId: string, ministerioId: string) {
    const chave = `${cultoId}-${ministerioId}`;
    setSelecionados((prev) => {
      const novo = new Set(prev);
      if (novo.has(chave)) {
        novo.delete(chave);
      } else {
        novo.add(chave);
      }
      return novo;
    });
  }

  async function salvar() {
    if (!usuarioId) return;

    setMensagem(null);

    // remove tudo que esse usuário tinha marcado antes
    const { error: deleteError } = await supabase
      .from("disponibilidades")
      .delete()
      .eq("usuario_id", usuarioId);

    if (deleteError) {
      console.error(deleteError);
      setMensagem("Erro ao salvar disponibilidade.");
      return;
    }

    // insere as novas marcações
    const registros = Array.from(selecionados).map((chave) => {
      const [cultoId, ministerioId] = chave.split("-");
      return {
        usuario_id: usuarioId,
        culto_id: cultoId,
        ministerio_id: ministerioId,
      };
    });

    if (registros.length > 0) {
      const { error: insertError } = await supabase
        .from("disponibilidades")
        .insert(registros);

      if (insertError) {
        console.error(insertError);
        setMensagem("Erro ao salvar disponibilidade.");
        return;
      }
    }

    setMensagem("Disponibilidade salva com sucesso!");
  }

  if (carregando) return <p>Carregando...</p>;

  return (
    <div className="forms">
      <p className="titulo">Minha disponibilidade</p>

      {ministerios.length === 0 ? (
        <p>Você ainda não está vinculado a nenhum ministério.</p>
      ) : (
        ministerios.map((ministerio) => (
          <div key={ministerio.id}>
            <h3>{ministerio.ministerio}</h3>

            {cultos.length === 0 ? (
              <p>Nenhum culto cadastrado ainda.</p>
            ) : (
              <ul className="lista-c">
                {cultos.map((culto) => {
                  const chave = `${culto.id}-${ministerio.id}`;
                  return (
                    <li key={chave} className="lista-culto">
                      <label>
                        <input
                          type="checkbox"
                          checked={selecionados.has(chave)}
                          onChange={() => alternar(culto.id, ministerio.id)}
                        />
                        {new Date(culto.dia + "T00:00:00").toLocaleDateString("pt-BR")}
                        {culto.descricao && ` — ${culto.descricao}`}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))
      )}

      <Button onClick={salvar}>Salvar disponibilidade</Button>

      {mensagem && <p>{mensagem}</p>}
    </div>
  );
}