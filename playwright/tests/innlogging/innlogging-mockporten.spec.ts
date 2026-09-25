import { Flate, test } from "../../fixtures/test";

const flater: Flate[] = [
    "arbeidsflate",
    "arbeidsflate-profil",
    "tilgangsstyring",
    "infoportalen",
];

for (const flate of flater) {
    test(
        `Bruker logger inn med Mockporten og lander innlogget på ${flate}`,
        async ({ innlogging, privatPerson, sider }) => {
            await innlogging.viaMockporten(sider[flate], privatPerson);
            await sider[flate].assertLoggedIn(privatPerson);
        },
    );
}
