import { describe, expect, it } from "vitest";
import { precisaDeAgua } from "@/lib/horta";

describe("alerta de umidade do solo", () => {
  it("alerta quando a umidade do solo está abaixo de 30%", () => {
    expect(precisaDeAgua(29)).toBe(true);
  });

  it("não alerta com umidade do solo em 30% ou mais", () => {
    expect(precisaDeAgua(30)).toBe(false);
  });
});
