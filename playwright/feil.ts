/**
 * Feil i oppsettet uten stack trace.
 *
 * At ENVIRONMENT mangler, eller at en spec ikke har sagt hvilke miljøer den er satt
 * opp for, handler om noe som mangler og ikke om en linje i koden. Stacken skjuler
 * bare meldingen, så den erstattes av meldingen selv. Playwright skriver ut `stack`.
 */
export function oppsettsfeil(melding: string): Error {
  const feil = new Error(melding);

  feil.stack = melding;

  return feil;
}

/**
 * Stopper kjøringen før Playwright har startet, altså mens config leses.
 *
 * Her finnes det ingen reportere ennå, så det er ingenting å skrive en rapport til,
 * og meldingen går rett til konsollet.
 */
export function stopp(melding: string): never {
  console.error(`\n${melding}\n`);
  process.exit(1);
}
