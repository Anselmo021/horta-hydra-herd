#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include "DHTesp.h"

// ---- Wi-Fi (rede simulada do Wokwi, sem senha) ----
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASS = "";

// ---- Supabase ----
const char* SUPABASE_URL = "https://kqgpkgjxtxhvwddbssvc.supabase.co";      // <<<
const char* SUPABASE_KEY = "sb_publishable_t9g0Djrc2dRrnWawq9QLkA_6C5lwShW";       // <<<

// ---- Pinos ----
const int PIN_DHT  = 15;
const int PIN_SOLO = 34;
const int PIN_RELE = 26;
const int PIN_LED  = 2;

const int LIMITE_SECO = 30;  // abaixo disso (%) o solo está seco

DHTesp dht;

void conectarWifi() {
  Serial.print("Conectando ao Wi-Fi");
  WiFi.begin(WIFI_SSID, WIFI_PASS, 6);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" conectado!");
}

// Envia uma leitura para a tabela "leituras"
void enviarLeitura(int solo, float temp, float ar, bool bomba) {
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.begin(client, String(SUPABASE_URL) + "/rest/v1/leituras");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Prefer", "return=minimal");

  String corpo = "{\"umidade_solo\":" + String(solo) +
                 ",\"temperatura\":" + String(temp, 1) +
                 ",\"umidade_ar\":" + String(ar, 1) +
                 ",\"bomba_ligada\":" + (bomba ? "true" : "false") + "}";

  int codigo = http.POST(corpo);
  Serial.print("Envio -> HTTP ");
  Serial.println(codigo);  // 201 = deu certo
  http.end();
}

// Busca o último comando do app: "ligar", "desligar" ou "auto"
String buscarComando() {
  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.begin(client, String(SUPABASE_URL) +
    "/rest/v1/acionamentos_bomba?select=acao&order=criado_em.desc&limit=1");
  http.addHeader("apikey", SUPABASE_KEY);

  String comando = "auto";
  int codigo = http.GET();
  if (codigo == 200) {
    String resposta = http.getString();
    if (resposta.indexOf("desligar") >= 0) comando = "desligar";
    else if (resposta.indexOf("ligar") >= 0) comando = "ligar";
  }
  http.end();
  return comando;
}

void setup() {
  Serial.begin(115200);
  dht.setup(PIN_DHT, DHTesp::DHT22);
  pinMode(PIN_RELE, OUTPUT);
  pinMode(PIN_LED, OUTPUT);
  conectarWifi();
}

void loop() {
  TempAndHumidity ar = dht.getTempAndHumidity();
  int umidadeSolo = map(analogRead(PIN_SOLO), 0, 4095, 0, 100);
  bool seco = umidadeSolo < LIMITE_SECO;

  // Comando do app tem prioridade; sem comando, funciona no automático
  String comando = buscarComando();
  bool bomba;
  if (comando == "ligar") bomba = true;
  else if (comando == "desligar") bomba = false;
  else bomba = seco;

  digitalWrite(PIN_RELE, bomba ? HIGH : LOW);
  digitalWrite(PIN_LED, seco ? HIGH : LOW);

  Serial.print("Solo: ");
  Serial.print(umidadeSolo);
  Serial.print("% | Temp: ");
  Serial.print(ar.temperature);
  Serial.print("C | Ar: ");
  Serial.print(ar.humidity);
  Serial.print("% | Comando: ");
  Serial.print(comando);
  Serial.print(" | Bomba: ");
  Serial.println(bomba ? "LIGADA" : "desligada");

  enviarLeitura(umidadeSolo, ar.temperature, ar.humidity, bomba);
  delay(5000);
}
