import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Leaf,
  Loader2,
  Power,
  PowerOff,
  Sparkles,
  Sprout,
  Thermometer,
  Wind,
  History,
  Radio,
} from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts";

import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import {
  acionamentosKey,
  enviarComando,
  useAcionamentos,
  useLeituras,
  useRealtimeHorta,
} from "@/hooks/use-horta";
import { LIMITE_UMIDADE_SOLO, precisaDeAgua, rotuloAcao, type AcaoBomba } from "@/lib/horta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Horta Conectada — Painel de irrigação" },
      {
        name: "description",
        content: "Monitore a umidade do solo, temperatura e controle a bomba de irrigação da sua horta em tempo real.",
      },
      { property: "og:title", content: "Horta Conectada — Painel de irrigação" },
      {
        property: "og:description",
        content: "Monitoramento e controle de irrigação em tempo real, direto do celular.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Painel,
});

const chartConfig = {
  umidade: { label: "Umidade do solo", color: "var(--chart-1)" },
} satisfies ChartConfig;

function fmtHora(iso: string) {
  return format(new Date(iso), "HH:mm", { locale: ptBR });
}
function fmtDataHora(iso: string) {
  return format(new Date(iso), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
}

function Painel() {
  const queryClient = useQueryClient();
  const leituras = useLeituras();
  const acionamentos = useAcionamentos();
  const [aoVivo, setAoVivo] = useState(false);
  const [enviando, setEnviando] = useState<AcaoBomba | null>(null);

  const onStatus = useCallback((ok: boolean) => setAoVivo(ok), []);
  useRealtimeHorta(onStatus);

  const ultima = leituras.data?.[0];
  const comandoAtual = acionamentos.data?.[0]?.acao;
  const alerta = precisaDeAgua(ultima?.umidade_solo);

  const dadosGrafico = [...(leituras.data ?? [])].reverse().map((l) => ({
    hora: fmtHora(l.criado_em),
    umidade: l.umidade_solo,
  }));

  async function comandar(acao: AcaoBomba) {
    setEnviando(acao);
    try {
      await enviarComando(acao);
      toast.success(`Comando enviado: ${rotuloAcao(acao)}`);
      queryClient.invalidateQueries({ queryKey: acionamentosKey });
    } catch (e) {
      toast.error("Não foi possível enviar o comando", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setEnviando(null);
    }
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Cabeçalho */}
      <header className="bg-gradient-hero text-hero-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 pb-20 pt-6 sm:px-6 sm:pt-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-glow/25 ring-1 ring-hero-foreground/20">
              <Sprout className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold sm:text-2xl">Horta Conectada</h1>
              <p className="text-xs text-hero-foreground/75 sm:text-sm">Monitoramento e irrigação</p>
            </div>
          </div>
          <div
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1",
              aoVivo
                ? "bg-primary-glow/20 ring-primary-glow/40"
                : "bg-hero-foreground/10 ring-hero-foreground/20",
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                aoVivo ? "animate-pulse-ring bg-primary-glow text-primary-glow" : "bg-sun",
              )}
            />
            {aoVivo ? "Ao vivo" : "Atualizando a cada 5s"}
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-14 max-w-5xl space-y-5 px-4 sm:px-6">
        {/* Alerta */}
        {ultima ? (
          alerta ? (
            <div
              role="alert"
              className="bg-gradient-alert flex items-center gap-4 rounded-3xl p-5 text-destructive-foreground shadow-lift"
            >
              <div className="flex size-12 shrink-0 animate-pulse-ring items-center justify-center rounded-full bg-destructive-foreground/20 text-destructive-foreground">
                <AlertTriangle className="size-7" />
              </div>
              <div>
                <p className="font-display text-xl font-bold sm:text-2xl">Planta precisa de água!</p>
                <p className="text-sm text-destructive-foreground/85">
                  Umidade do solo em {ultima.umidade_solo}% — abaixo de {LIMITE_UMIDADE_SOLO}%.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-ok flex items-center gap-4 rounded-3xl p-5 text-success-foreground shadow-lift">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-success-foreground/20">
                <CheckCircle2 className="size-7" />
              </div>
              <div>
                <p className="font-display text-xl font-bold sm:text-2xl">Solo bem hidratado</p>
                <p className="text-sm text-success-foreground/85">
                  Umidade do solo em {ultima.umidade_solo}%. Tudo certo por aqui.
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center gap-3 rounded-3xl bg-card p-5 shadow-lift">
            {leituras.isError ? (
              <p className="text-sm text-destructive">Não foi possível carregar as leituras.</p>
            ) : (
              <>
                <Loader2 className="size-5 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  {leituras.isLoading ? "Carregando leituras…" : "Nenhuma leitura recebida ainda."}
                </p>
              </>
            )}
          </div>
        )}

        {/* Cartões */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Metrica
            icone={<Droplets />}
            titulo="Umidade do solo"
            valor={ultima ? `${ultima.umidade_solo}` : "—"}
            unidade="%"
            tom={alerta ? "alerta" : "primario"}
          />
          <Metrica
            icone={<Thermometer />}
            titulo="Temperatura"
            valor={ultima ? ultima.temperatura.toFixed(1).replace(".", ",") : "—"}
            unidade="°C"
            tom="sol"
          />
          <Metrica
            icone={<Wind />}
            titulo="Umidade do ar"
            valor={ultima ? ultima.umidade_ar.toFixed(0) : "—"}
            unidade="%"
            tom="agua"
          />
          <Metrica
            icone={ultima?.bomba_ligada ? <Power /> : <PowerOff />}
            titulo="Bomba"
            valor={ultima ? (ultima.bomba_ligada ? "Ligada" : "Desligada") : "—"}
            tom={ultima?.bomba_ligada ? "primario" : "neutro"}
            texto
          />
        </section>
        {ultima && (
          <p className="-mt-2 text-right text-xs text-muted-foreground">
            Última leitura: {fmtDataHora(ultima.criado_em)}
          </p>
        )}

        {/* Gráfico */}
        <section className="rounded-3xl border bg-card p-4 shadow-soft sm:p-6">
          <div className="mb-4 flex items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Umidade do solo</h2>
              <p className="text-xs text-muted-foreground">Últimas 30 leituras</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-0.5 w-4 border-t-2 border-dashed border-destructive" />
              Limite {LIMITE_UMIDADE_SOLO}%
            </span>
          </div>
          {dadosGrafico.length > 0 ? (
            <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full sm:h-72">
              <LineChart data={dadosGrafico} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="hora" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <ReferenceLine y={LIMITE_UMIDADE_SOLO} stroke="var(--destructive)" strokeDasharray="5 5" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="umidade"
                  stroke="var(--color-umidade)"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "var(--color-umidade)" }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
              Sem dados para exibir.
            </div>
          )}
        </section>

        {/* Controle */}
        <section className="rounded-3xl border bg-card p-4 shadow-soft sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Controle da bomba</h2>
              <p className="text-xs text-muted-foreground">Envie um comando para a horta</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs text-secondary-foreground">
              <Radio className="size-3.5" />
              Comando atual: <strong className="font-semibold">{rotuloAcao(comandoAtual)}</strong>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <Button
              variant="control"
              size="tile"
              data-active={comandoAtual === "ligar"}
              disabled={enviando !== null}
              onClick={() => comandar("ligar")}
            >
              {enviando === "ligar" ? <Loader2 className="animate-spin" /> : <Power />}
              <span className="whitespace-normal text-center leading-tight">Ligar bomba</span>
            </Button>
            <Button
              variant="controlOff"
              size="tile"
              data-active={comandoAtual === "desligar"}
              disabled={enviando !== null}
              onClick={() => comandar("desligar")}
            >
              {enviando === "desligar" ? <Loader2 className="animate-spin" /> : <PowerOff />}
              <span className="whitespace-normal text-center leading-tight">Desligar bomba</span>
            </Button>
            <Button
              variant="controlAuto"
              size="tile"
              data-active={comandoAtual === "auto"}
              disabled={enviando !== null}
              onClick={() => comandar("auto")}
            >
              {enviando === "auto" ? <Loader2 className="animate-spin" /> : <Sparkles />}
              <span className="whitespace-normal text-center leading-tight">Modo automático</span>
            </Button>
          </div>
        </section>

        {/* Histórico */}
        <section className="rounded-3xl border bg-card p-4 shadow-soft sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <History className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Últimos acionamentos</h2>
          </div>
          {acionamentos.data && acionamentos.data.length > 0 ? (
            <ul className="divide-y">
              {acionamentos.data.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <IconeAcao acao={a.acao} />
                    <div>
                      <p className="text-sm font-semibold">{rotuloAcao(a.acao)}</p>
                      <p className="text-xs text-muted-foreground">{fmtDataHora(a.criado_em)}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {a.origem}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {acionamentos.isLoading ? "Carregando…" : "Nenhum acionamento registrado."}
            </p>
          )}
        </section>

        <footer className="flex items-center justify-center gap-1.5 pt-2 text-xs text-muted-foreground">
          <Leaf className="size-3.5" /> Horta Conectada
        </footer>
      </main>
    </div>
  );
}

type Tom = "primario" | "alerta" | "sol" | "agua" | "neutro";

const tomClasses: Record<Tom, string> = {
  primario: "bg-secondary text-primary",
  alerta: "bg-destructive/10 text-destructive",
  sol: "bg-sun/20 text-sun-foreground",
  agua: "bg-water/15 text-water",
  neutro: "bg-muted text-muted-foreground",
};

function Metrica({
  icone,
  titulo,
  valor,
  unidade,
  tom,
  texto,
}: {
  icone: ReactNode;
  titulo: string;
  valor: string;
  unidade?: string;
  tom: Tom;
  texto?: boolean;
}) {
  return (
    <div className="rounded-3xl border bg-card p-4 shadow-soft sm:p-5">
      <div className={cn("mb-3 flex size-10 items-center justify-center rounded-xl [&_svg]:size-5", tomClasses[tom])}>
        {icone}
      </div>
      <p className="text-xs font-medium text-muted-foreground sm:text-sm">{titulo}</p>
      <p
        className={cn(
          "font-display font-semibold tracking-tight",
          texto ? "mt-1 text-xl sm:text-2xl" : "text-3xl sm:text-4xl",
          tom === "alerta" && "text-destructive",
        )}
      >
        {valor}
        {unidade && valor !== "—" && <span className="ml-0.5 text-base font-medium text-muted-foreground">{unidade}</span>}
      </p>
    </div>
  );
}

function IconeAcao({ acao }: { acao: string }) {
  const map: Record<string, { icon: ReactNode; cls: string }> = {
    ligar: { icon: <Power />, cls: "bg-secondary text-primary" },
    desligar: { icon: <PowerOff />, cls: "bg-destructive/10 text-destructive" },
    auto: { icon: <Sparkles />, cls: "bg-sun/20 text-sun-foreground" },
  };
  const item = map[acao] ?? { icon: <Radio />, cls: "bg-muted text-muted-foreground" };
  return (
    <div className={cn("flex size-9 items-center justify-center rounded-xl [&_svg]:size-4", item.cls)}>
      {item.icon}
    </div>
  );
}
