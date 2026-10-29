# Horta Hydra Herd

Crie um aplicativo web responsivo em português chamado "Horta Conectada", um painel de monitoramento e controle de irrigação, com visual limpo, verde e moderno, que funcione bem no celular.

Use o Supabase que JÁ EXISTE (não crie outro banco), com @supabase/supabase-js:
- URL: COLE_AQUI_SUA_URL
- Chave publishable: COLE_AQUI_SUA_CHAVE

Tabelas existentes:
1) "leituras": id, umidade_solo (int, em %), temperatura (float), umidade_ar (float), bomba_ligada (boolean), criado_em (timestamp)
2) "acionamentos_bomba": id, acao (text), origem (text), criado_em (timestamp)

O painel deve ter:
- Cartões com a última leitura: umidade do solo (%), temperatura (°C), umidade do ar (%) e status da bomba (Ligada/Desligada).
- Gráfico de linha com a umidade do solo nas últimas 30 leituras (eixo X com a hora).
- Alerta vermelho bem visível quando a umidade do solo estiver abaixo de 30%: "Planta precisa de água!". Quando estiver ok, mostrar um indicador verde.
- Três botões de controle: "Ligar bomba", "Desligar bomba" e "Modo automático". Cada clique faz um INSERT em "acionamentos_bomba" com acao = "ligar", "desligar" ou "auto" e origem = "app", e mostra uma mensagem de confirmação.
- Mostrar qual é o comando atual (a acao mais recente da tabela).
- Histórico dos últimos 10 acionamentos (ação, origem, data e hora).
- Atualização em tempo real com Supabase Realtime nas duas tabelas, e também um refresh automático a cada 5 segundos como reserva.

Não precisa de login. Não altere o esquema das tabelas.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://horta-hydra-herd.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/43b4a8d1-196e-4b18-91f3-a5b8f5cdaed6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
