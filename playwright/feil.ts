/**
 * Stopper kjøringen med en melding og uten stack trace.
 *
 * Feil i oppsettet handler om noe som mangler i config eller i en spec, ikke om en
 * linje i koden, og da er stacken bare støy som skjuler meldingen. Meldingen skrives
 * derfor rett ut, og prosessen avsluttes med feilkode slik at CI ser forskjellen.
 */
export function stopp(melding: string): never {
  console.error(`\n${melding}\n`);
  process.exit(1);
}
