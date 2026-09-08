"use client";

import { useState } from "react";
import styles from "./wizard-configuracao.module.css";
import Ministerios from "./ministerios";
import GerenciarTemplates from "./modelo-cultos";
import AtribuirMinisterio from "./atribuir-ministerio";
import Cultos from "./cultos";
import VagasCulto from "./vagas-culto";
import GerarEscala from "./gerar-escala";

const ETAPAS = [
  { id: "ministerios", titulo: "Ministérios" },
  { id: "templates", titulo: "Modelos (opcional)" },
  { id: "atribuir", titulo: "Atribuir Usuários" },
  { id: "cultos", titulo: "Cultos" },
  { id: "vagas", titulo: "Vagas do Culto" },
  { id: "gerar", titulo: "Gerar Escala" },
];

export default function WizardConfiguracao() {
  const [etapaAtual, setEtapaAtual] = useState(0);

  function proxima() {
    setEtapaAtual((e) => Math.min(e + 1, ETAPAS.length - 1));
  }

  function anterior() {
    setEtapaAtual((e) => Math.max(e - 1, 0));
  }

  function renderizarEtapa() {
    switch (ETAPAS[etapaAtual].id) {
      case "ministerios":
        return <Ministerios />;
      case "templates":
        return <GerenciarTemplates />;
      case "atribuir":
        return <AtribuirMinisterio />;
      case "cultos":
        return <Cultos />;
      case "vagas":
        return <VagasCulto />;
      case "gerar":
        return <GerarEscala />;
      default:
        return null;
    }
  }

  return (
    <>
      {renderizarEtapa()}

      <div className={styles.navFlutuante}>
        <button onClick={anterior} disabled={etapaAtual === 0}>
          ← Anterior
        </button>
        <span className={styles.contadorEtapa}>
          {etapaAtual + 1} / {ETAPAS.length} — {ETAPAS[etapaAtual].titulo}
        </span>
        <button onClick={proxima} disabled={etapaAtual === ETAPAS.length - 1}>
          Próximo →
        </button>
      </div>
    </>
  );
}