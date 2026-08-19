import { supabase } from "@/lib/supabase";

type VagaFuncao = { funcao: string; quantidade: number };

export async function gerarEscala(cultoId: string, ministerioId: string, criadoPorId: string) {
  // 1. dados do culto atual
  const { data: culto } = await supabase
    .from("cultos")
    .select("id, dia")
    .eq("id", cultoId)
    .single();

  if (!culto) throw new Error("Culto não encontrado");

  const diaSemanaAtual = new Date(culto.dia + "T00:00:00").getDay();

  // 2. vagas necessárias
const { data: vagas } = await supabase
  .from("cultos_funcao")
  .select("funcao, quantidade")
  .eq("culto_id", cultoId)
  .eq("ministerio_id", ministerioId);

  if (!vagas || vagas.length === 0) throw new Error("Nenhuma vaga definida para este culto");

  // 3. disponíveis nesse culto+ministério, com a função de cada um
  const { data: disponibilidades } = await supabase
    .from("disponibilidades")
    .select("usuario_id")
    .eq("culto_id", cultoId)
    .eq("ministerio_id", ministerioId);

  const idsDisponiveis = (disponibilidades ?? []).map((d) => d.usuario_id);

  let candidatosBase: { usuario_id: string; funcao: string }[] = [];

  if (idsDisponiveis.length > 0) {
    const { data: vinculos } = await supabase
      .from("usuario_ministerio")
      .select("usuario_id, funcao")
      .eq("ministerio_id", ministerioId)
      .in("usuario_id", idsDisponiveis);

    candidatosBase = vinculos ?? [];
  }

  // 4. achar o culto anterior de mesmo dia da semana
  const { data: cultosAnteriores } = await supabase
    .from("cultos")
    .select("id, dia")
    .lt("dia", culto.dia)
    .order("dia", { ascending: false })
    .limit(30);

  const cultoAnteriorMesmoDia = (cultosAnteriores ?? []).find(
  (c) => new Date(c.dia + "T00:00:00").getDay() === diaSemanaAtual);

  let escaladosNoAnterior = new Set<string>();

  if (cultoAnteriorMesmoDia) {
    const { data: escalaAnterior } = await supabase
      .from("escalas")
      .select("id, escala_usuario(usuario_id)")
      .eq("culto_id", cultoAnteriorMesmoDia.id)
      .eq("ministerio_id", ministerioId)
      .maybeSingle();

    if (escalaAnterior) {
      escaladosNoAnterior = new Set(
        (escalaAnterior.escala_usuario as any[]).map((e) => e.usuario_id)
      );
    }
  }

  // 5. última vez que cada candidato foi escalado
  let ultimaEscalaPorUsuario = new Map<string, string>();

  if (candidatosBase.length > 0) {
    const { data: historico } = await supabase
      .from("escala_usuario")
      .select("usuario_id, escalas!inner(criada_em)")
      .in("usuario_id", candidatosBase.map((c) => c.usuario_id));

    (historico ?? []).forEach((h: any) => {
      const atual = ultimaEscalaPorUsuario.get(h.usuario_id);
      if (!atual || h.escalas.criada_em > atual) {
        ultimaEscalaPorUsuario.set(h.usuario_id, h.escalas.criada_em);
      }
    });
  }

  // 6. montar a escalação, função por função
  const escalados: { usuario_id: string; funcao: string }[] = [];
  const avisos: string[] = [];
  const jaEscaladosNestaEscala = new Set<string>();

  for (const vaga of vagas as VagaFuncao[]) {
    const candidatosDaFuncao = candidatosBase.filter(
      (c) => c.funcao === vaga.funcao && !jaEscaladosNestaEscala.has(c.usuario_id)
    );

    const semRepeticao = candidatosDaFuncao.filter((c) => !escaladosNoAnterior.has(c.usuario_id));

    function ordenarPorMenosEscalado(lista: typeof candidatosDaFuncao) {
      return [...lista].sort((a, b) => {
        const dataA = ultimaEscalaPorUsuario.get(a.usuario_id) ?? "";
        const dataB = ultimaEscalaPorUsuario.get(b.usuario_id) ?? "";
        return dataA.localeCompare(dataB);
      });
    }

    let selecionados = ordenarPorMenosEscalado(semRepeticao).slice(0, vaga.quantidade);

    if (selecionados.length < vaga.quantidade) {
      const faltam = vaga.quantidade - selecionados.length;
      const jaEscolhidos = new Set(selecionados.map((s) => s.usuario_id));
      const reserva = ordenarPorMenosEscalado(
        candidatosDaFuncao.filter((c) => !jaEscolhidos.has(c.usuario_id))
      ).slice(0, faltam);

      if (reserva.length > 0) {
        avisos.push(
          `Função "${vaga.funcao}": não havia gente suficiente sem repetir do culto anterior, ${reserva.length} vaga(s) preenchida(s) repetindo.`
        );
      }

      selecionados = [...selecionados, ...reserva];
    }

    if (selecionados.length < vaga.quantidade) {
      avisos.push(
        `Função "${vaga.funcao}": faltaram ${vaga.quantidade - selecionados.length} vaga(s) — ninguém disponível suficiente.`
      );
    }

    selecionados.forEach((s) => {
      escalados.push({ usuario_id: s.usuario_id, funcao: vaga.funcao });
      jaEscaladosNestaEscala.add(s.usuario_id);
    });
  }

  // 7. salvar no banco
  const { data: novaEscala, error: erroEscala } = await supabase
    .from("escalas")
    .insert([{ culto_id: cultoId, ministerio_id: ministerioId, criado_por: criadoPorId }])
    .select()
    .single();

  if (erroEscala || !novaEscala) throw erroEscala;

  if (escalados.length > 0) {
    const registros = escalados.map((e) => ({
      escala_id: novaEscala.id,
      usuario_id: e.usuario_id,
      funcao: e.funcao,
    }));

    const { error: erroInsercao } = await supabase.from("escala_usuario").insert(registros);
    if (erroInsercao) throw erroInsercao;
  }

  return { escala: novaEscala, escalados, avisos };
}