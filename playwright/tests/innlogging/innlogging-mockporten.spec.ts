import { Flate, test } from "../../fixtures/test";
import { runInEnvironment } from "../../miljo";
import { Testbruker } from "../../testdata";

runInEnvironment("at23", "tt02", "prod");

test.use({ testbrukerPath: Testbruker.PrivatPersonUtenVirksomhet });

const flater: Flate[] = [
    "arbeidsflate",
    "arbeidsflate-profil",
    "tilgangsstyring",
    "infoportalen",
];

for (const flate of flater) {
    test(
        `Bruker logger inn med Mockporten og lander innlogget på ${flate}`,
        async ({ innlogging, user, sider }) => {
            await innlogging.viaMockporten(sider[flate], user);
            await sider[flate].assertLoggedIn(user);
        },
    );
}
