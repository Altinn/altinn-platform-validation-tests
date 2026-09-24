/**
 * Feil i oppsettet uten stack trace.
 *
 * At en spec ikke har sagt hvilke miljøer den er satt opp for handler om noe som
 * mangler og ikke om en linje i koden. Stacken skjuler bare meldingen, så den
 * erstattes av meldingen selv. Playwright skriver ut `stack`.
 */
export function oppsettsfeil(melding: string): Error {
  const feil = new Error(melding);

  feil.stack = melding;

  return feil;
}
