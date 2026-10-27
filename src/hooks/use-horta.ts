import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase";
import type { Acionamento, Leitura } from "@/lib/horta";

const REFRESH_MS = 5000;

export const leiturasKey = ["leituras"] as const;
export const acionamentosKey = ["acionamentos_bomba"] as const;

async function fetchLeituras(): Promise<Leitura[]> {
  const { data, error } = await getSupabase()
    .from("leituras")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? []) as Leitura[];
}

async function fetchAcionamentos(): Promise<Acionamento[]> {
  const { data, error } = await getSupabase()
    .from("acionamentos_bomba")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(10);
  if (error) throw error;
  return (data ?? []) as Acionamento[];
}

export function useLeituras() {
  return useQuery({ queryKey: leiturasKey, queryFn: fetchLeituras, refetchInterval: REFRESH_MS });
}

export function useAcionamentos() {
  return useQuery({
    queryKey: acionamentosKey,
    queryFn: fetchAcionamentos,
    refetchInterval: REFRESH_MS,
  });
}

/** Subscribes to Realtime changes on both tables and refreshes the matching queries. */
export function useRealtimeHorta(onStatus?: (connected: boolean) => void) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = getSupabase();
    const channel = supabase
      .channel("horta-conectada")
      .on("postgres_changes", { event: "*", schema: "public", table: "leituras" }, () => {
        queryClient.invalidateQueries({ queryKey: leiturasKey });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "acionamentos_bomba" }, () => {
        queryClient.invalidateQueries({ queryKey: acionamentosKey });
      })
      .subscribe((status) => {
        onStatus?.(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, onStatus]);
}

export async function enviarComando(acao: string) {
  const { error } = await getSupabase()
    .from("acionamentos_bomba")
    .insert({ acao, origem: "app" });
  if (error) throw error;
}
