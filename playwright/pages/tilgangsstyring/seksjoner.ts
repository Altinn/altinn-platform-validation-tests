import { Sprak } from "../../config/sprak";

/**
 * Navigasjonsvalgene i sidemenyen på tilgangsstyring, som nøkler. Hvilke av dem
 * en bruker faktisk ser avhenger av tilgangene til brukeren, så det hører til
 * testdataene og ikke hit. Her ligger bare hva de heter på hvert språk.
 */
export enum Seksjon {
    Foresporsler = "foresporsler",
    Brukere = "brukere",
    Fullmakter = "fullmakter",
    FullmakterHosAndre = "fullmakterHosAndre",
    SamtykkeOgFullmaktsavtaler = "samtykkeOgFullmaktsavtaler",
}

/**
 * Stien hver seksjon lenker til i sidemenyen, fra `amUIPath` i tilgangsstyring.
 * Språkuavhengig, og uten telleren tilgangsstyring legger i navnet når brukeren har
 * ubehandlede forespørsler.
 */
export const seksjonssti: Record<Seksjon, string> = {
    [Seksjon.Foresporsler]: "requests",
    [Seksjon.Brukere]: "users",
    [Seksjon.Fullmakter]: "poa-overview",
    [Seksjon.FullmakterHosAndre]: "received-from",
    [Seksjon.SamtykkeOgFullmaktsavtaler]: "consent/active",
};

export const seksjonsnavn: Record<Sprak, Record<Seksjon, string>> = {
    [Sprak.Bokmaal]: {
        [Seksjon.Foresporsler]: "Forespørsler",
        [Seksjon.Brukere]: "Brukere",
        [Seksjon.Fullmakter]: "Fullmakter",
        [Seksjon.FullmakterHosAndre]: "Fullmakter hos andre",
        [Seksjon.SamtykkeOgFullmaktsavtaler]: "Samtykke- og fullmaktsavtaler",
    },
    [Sprak.Nynorsk]: {
        [Seksjon.Foresporsler]: "Førespurnader",
        [Seksjon.Brukere]: "Brukarar",
        [Seksjon.Fullmakter]: "Fullmakter",
        [Seksjon.FullmakterHosAndre]: "Fullmakter hos andre",
        [Seksjon.SamtykkeOgFullmaktsavtaler]: "Samtykke- og fullmaktsavtaler",
    },
    [Sprak.Engelsk]: {
        [Seksjon.Foresporsler]: "Requests",
        [Seksjon.Brukere]: "Users",
        [Seksjon.Fullmakter]: "Powers of attorney",
        [Seksjon.FullmakterHosAndre]: "Powers of attorney from others",
        [Seksjon.SamtykkeOgFullmaktsavtaler]: "Consent and power of attorney agreements",
    },
};
