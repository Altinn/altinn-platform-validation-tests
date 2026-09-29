// Miljøene der cookiebanneret vises på hver flate. Arbeidsflaten har det skrudd av i
// tt02 (global.enableCookieBanner), og tilgangsstyring mangler det i prod.
export const bannerVisesI = {
    arbeidsflate: ["@at23", "@prod"],
    arbeidsflateProfil: ["@at23", "@prod"],
    tilgangsstyring: ["@at23", "@tt02"],
    infoportal: ["@at23", "@tt02", "@prod"],
} as const;

export type Flate = keyof typeof bannerVisesI;

export const flater = Object.keys(bannerVisesI) as Flate[];
