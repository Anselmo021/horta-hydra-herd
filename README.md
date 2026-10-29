# 🌱 Horta Conectada

Sistema de **IoT** para monitorar e controlar a irrigação de uma horta: um dispositivo **ESP32** mede a umidade do solo, a temperatura e a umidade do ar, envia os dados pela internet para um banco de dados na nuvem, e um **aplicativo web** mostra tudo em tempo real e permite ligar ou desligar a bomba d'água remotamente.

Projeto de extensão do Tema Integrador IV (Inteligência Artificial e IoT), do curso de Análise e Desenvolvimento de Sistemas (4º período), da UNIG.

## 🔗 Links

- **Aplicativo online:** https://horta-hydra-herd.lovable.app
- **Simulação do circuito (Wokwi):** https://wokwi.com/projects/478994523962369025

## 🎯 Objetivo

Ajudar um parceiro da comunidade (horta) a economizar água e cuidar melhor das plantas, evitando a rega "no olho": a planta seca por falta de água ou a água é desperdiçada por excesso.

Alinhado aos ODS da ONU:
- **ODS 9:** Indústria, Inovação e Infraestrutura
- **ODS 11:** Cidades e Comunidades Sustentáveis

## 🧩 Arquitetura

```
ESP32 + sensores (Wokwi)  ──HTTP──▶  Supabase (banco na nuvem)  ──▶  App web (Lovable)
        ▲                                                                   │
        └──────────── comando "ligar / desligar / auto" ◀───────────────────┘
```

1. O ESP32 lê os sensores a cada 5 segundos e envia a leitura ao Supabase (tabela `leituras`).
2. O aplicativo exibe a última leitura, um gráfico das últimas 30 leituras e um alerta quando o solo está seco.
3. Ao clicar em um botão do app, o comando é gravado na tabela `acionamentos_bomba`.
4. O ESP32 consulta o último comando e aciona (ou não) o relé da bomba.

## 🛠️ Tecnologias

| Camada | Ferramenta |
| --- | --- |
| Simulação do circuito | Wokwi |
| Microcontrolador | ESP32 (C/C++, Arduino) |
| Comunicação | Wi-Fi, HTTP/REST |
| Banco de dados | Supabase (PostgreSQL) |
| Front-end | Lovable (React) |
| Versionamento | GitHub |

## 🔌 Circuito e pinagem

| Componente | Pino do ESP32 |
| --- | --- |
| Sensor DHT22 (temperatura e umidade do ar) | GPIO 15 |
| Potenciômetro (simula a umidade do solo) | GPIO 34 |
| Módulo relé (bomba d'água) | GPIO 26 |
| LED de alerta | GPIO 2 |

> Na versão física, o potenciômetro seria substituído por um sensor de umidade de solo (higrômetro) no mesmo pino.

O esquema completo está em [`firmware/diagram.json`](firmware/diagram.json).

## 🗄️ Banco de dados

**`leituras`:** `id`, `umidade_solo`, `temperatura`, `umidade_ar`, `bomba_ligada`, `criado_em`

**`acionamentos_bomba`:** `id`, `acao` (`ligar`, `desligar` ou `auto`), `origem`, `criado_em`

## ⚙️ Como funciona a irrigação

- **Modo automático (`auto`):** se a umidade do solo estiver abaixo de **30%**, a bomba liga e o LED acende.
- **Comando `ligar` / `desligar`:** enviado pelo aplicativo, tem prioridade sobre o modo automático.

## ▶️ Como testar

1. Abra o projeto no Wokwi e clique em **play** ▶️. No monitor serial deve aparecer `conectado!` e `Envio -> HTTP 201`.
2. Abra o aplicativo online ao lado.
3. Gire o **potenciômetro** no Wokwi: o gráfico e os cartões do app mudam em poucos segundos.
4. Clique em **Ligar bomba** no app: o monitor do Wokwi passa a mostrar `Comando: ligar | Bomba: LIGADA`.
5. Clique em **Modo automático** para voltar ao normal.

> O Wokwi precisa estar rodando e visível na tela para enviar leituras novas.

## 📁 Estrutura do repositório

```
├── firmware/
│   ├── horta_conectada.ino   # código do ESP32
│   └── diagram.json          # circuito do Wokwi
└── src/                      # código do aplicativo web
```

## 🔒 Observação sobre segurança

O código do ESP32 usa apenas a chave **publishable** do Supabase, própria para ficar em código público. Chaves secretas (`service_role` / `secret`) **não** devem ser colocadas no repositório.

## 👤 Autor

**Jonatas Anselmo**
Curso de Análise e Desenvolvimento de Sistemas, 4º período, UNIG
