import { test } from "../../fixtures/test";
import { bannerVisesI, Flate, flater } from "./utrulling";

// Valget veksler mellom flatene, så både Ja og Nei blir testet.
const valg: Record<Flate, "godta" | "avsla"> = {
    arbeidsflate: "godta",
    arbeidsflateProfil: "avsla",
    tilgangsstyring: "godta",
    infoportal: "avsla",
};

for (const start of flater) {
    test(`Cookievalg fra ${start} tas hensyn til på alle flater`, { tag: [...bannerVisesI[start]] }, async ({
        innlogging,
        user,
        arbeidsflate,
        arbeidsflateProfil,
        tilgangsstyring,
        infoportal,
    }) => {
        const sider = { arbeidsflate, arbeidsflateProfil, tilgangsstyring, infoportal };

        await test.step(`Bruker tar et valg i cookiebanneret på ${start}`, async () => {
            // Infoportalen er åpen, så valget tas før innloggingen.
            if (start === "infoportal") {
                await infoportal.navigateTo();
                await infoportal.cookiebanner[valg[start]]();
                await innlogging.logIn(arbeidsflate, user);
            } else {
                await innlogging.logIn(sider[start], user);
                await sider[start].cookiebanner[valg[start]]();
            }
        });

        await test.step("Banneret vises ikke igjen på de andre flatene", async () => {
            for (const flate of flater.filter((f) => f !== start)) {
                await sider[flate].navigateTo();
                // Flaten må være kommet opp først. Banneret rendres tidlig, så "vises ikke"
                // er sant også på en tom side.
                await sider[flate].assertLoggedIn(user);
                await sider[flate].cookiebanner.assertHidden();
            }
        });
    });
}
