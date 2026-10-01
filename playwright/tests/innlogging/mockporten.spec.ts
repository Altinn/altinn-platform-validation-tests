import { test } from "../../fixtures/test";

// Røyktest av Mockporten i testmiljøene, der de andre testene logger inn med TestID.
// Prod bruker Mockporten for alle testene, så der trengs ikke denne.
test.use({ mockporten: true });

test("Bruker logger inn via Mockporten", { tag: ["@at23", "@tt02"] }, async ({
    innlogging,
    user,
    arbeidsflate,
}) => {
    await test.step("Bruker logger inn via Mockporten", async () => {
        await innlogging.loggInnViaArbeidsflate(user);
    });

    await test.step("Bruker er innlogget på arbeidsflate", async () => {
        await arbeidsflate.assertLoggedIn();
    });
});
