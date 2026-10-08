/**
 * Hvor lenge en flate får på å komme til rette etter en utlogging. Playwrights
 * standard på fem sekunder er for kort: flaten omdirigerer noen ganger til ID-porten
 * og rendrer andre ganger seg selv utlogget, og begge veiene kan bruke lengre tid
 * enn det.
 */
export const REDIRECT_TIMEOUT = 20_000;

/**
 * Hvor lenge innboksen får på å vise en ny fullmakt eller et nytt utkast. Dialogporten
 * mellomlagrer aktørene og tjenestene til en bruker i 15 minutter, så venting rundt det
 * må vare lenger. Siden lastes på nytt mellom hvert forsøk, derfor ikke for ofte.
 */
export const DIALOGPORTEN_TIMEOUT = 16 * 60_000;
export const DIALOGPORTEN_INTERVALLER = [5_000, 10_000, 15_000];
