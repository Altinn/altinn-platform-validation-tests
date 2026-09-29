import { test } from "../../fixtures/test";

// Cookievalg-testene sjekker at banneret er borte på de andre flatene, og det er
// bare verdt noe når banneret faktisk vises der for en ny sesjon. Banneret er ikke
// rullet ut likt: arbeidsflaten har det skrudd av i tt02, og tilgangsstyring mangler
// det i prod.
const flater = {
    arbeidsflate: ["@at23", "@prod"],
    arbeidsflateProfil: ["@at23", "@prod"],
    tilgangsstyring: ["@at23", "@tt02"],
    infoportal: ["@at23", "@tt02", "@prod"],
} as const;

for (const [flate, tag] of Object.entries(flater) as [keyof typeof flater, readonly string[]][]) {
    test(`Cookiebanneret vises på ${flate} for en ny sesjon`, { tag: [...tag] }, async ({
        innlogging,
        user,
        arbeidsflate,
        arbeidsflateProfil,
        tilgangsstyring,
        infoportal,
    }) => {
        const sider = { arbeidsflate, arbeidsflateProfil, tilgangsstyring, infoportal };

        await innlogging.logIn(sider[flate], user);
        await sider[flate].assertLoggedIn(user);
        await sider[flate].cookiebanner.assertVisible();
    });
}
