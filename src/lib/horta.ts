export type Leitura = {
  id: number;
  umidade_solo: number;
  temperatura: number;
  umidade_ar: number;
  bomba_ligada: boolean;
  criado_em: string;
};

export type Acionamento = {
  id: number;
  acao: string;
  origem: string;
  criado_em: string;
};

export type AcaoBomba = "ligar" | "desligar" | "auto";

/** Soil moisture below this percentage triggers the "needs water" alert. */
export const LIMITE_UMIDADE_SOLO = 30;

export function precisaDeAgua(umidadeSolo: number | null | undefined): boolean {
  if (umidadeSolo === null || umidadeSolo === undefined) return false;
  return umidadeSolo < LIMITE_UMIDADE_SOLO;
}

export const ROTULO_ACAO: Record<string, string> = {
  ligar: "Ligar bomba",
  desligar: "Desligar bomba",
  auto: "Modo automático",
};

export function rotuloAcao(acao: string | null | undefined): string {
  if (!acao) return "Nenhum comando";
  return ROTULO_ACAO[acao] ?? acao;
}
