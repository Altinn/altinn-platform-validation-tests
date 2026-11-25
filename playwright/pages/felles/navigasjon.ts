/**
 * Hvor lenge en flate får på å komme til rette etter en utlogging. Playwrights
 * standard på fem sekunder er for kort: flaten omdirigerer noen ganger til ID-porten
 * og rendrer andre ganger seg selv utlogget, og begge veiene kan bruke lengre tid
 * enn det.
 */
export const REDIRECT_TIMEOUT = 20_000;

/**
 * Hvor lenge innboksen får på å vise en ny fullmakt eller et nytt utkast. Dialogporten
 * mellomlagrer aktørene til en bruker i 15 minutter uten å tømme cachen når fullmakter
 * endres, så en ny fullmakt vises først etter rundt 12 minutter. Det er en kjent feil,
 * ikke forventet oppførsel, og en test som må vente så lenge, er for treg og ustabil
 * til å si noe om bruksmønsteret, se #695. Siden lastes på nytt mellom hvert forsøk,
 * derfor ikke for ofte.
 */
export const DIALOGPORTEN_TIMEOUT = 16 * 60_000;
export const DIALOGPORTEN_INTERVALLER = [5_000, 10_000, 15_000];
