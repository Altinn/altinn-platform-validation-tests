import { test } from "../../fixtures/test";
import { bannerVisesI, flater } from "./utrulling";

// Cookievalg-testene sjekker at banneret er borte på de andre flatene, og det er
// bare verdt noe når banneret faktisk vises der for en ny sesjon.
for (const flate of flater) {
    test(`Cookiebanneret vises på ${flate} for en ny sesjon`, { tag: [...bannerVisesI[flate]] }, async ({
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
