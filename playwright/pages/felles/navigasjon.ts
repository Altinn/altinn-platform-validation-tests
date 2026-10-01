/**
 * Hvor lenge en flate får på å komme til rette etter en utlogging. Playwrights
 * standard på fem sekunder er for kort: flaten omdirigerer noen ganger til ID-porten
 * og rendrer andre ganger seg selv utlogget, og begge veiene kan bruke lengre tid
 * enn det.
 */
export const REDIRECT_TIMEOUT = 20_000;
