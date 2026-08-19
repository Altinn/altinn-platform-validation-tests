export type Miljo = "at22" | "at23" | "tt02" | "prod";

/**
 * Miljøet testene kjører mot, satt med ENVIRONMENT. Brukes til å hoppe over
 * tester som ikke kan kjøre overalt, se kjoresBareI i fixtures/test.ts.
 */
export function gjeldendeMiljo(): Miljo {
  return (process.env.ENVIRONMENT || "at23") as Miljo;
}
