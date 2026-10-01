import { test } from "../../fixtures/test";

// En utlogget bruker som åpner en lenke til en beskyttet side, for eksempel fra et
// varsel, skal sendes til innlogging og lande på siden lenken pekte på.
test("Bruker som åpner en lenke til profilen logges inn og lander på profilen", { tag: ["@at23", "@tt02"] }, async ({
    innlogging,
    user,
    arbeidsflateProfil,
}) => {
    await test.step("Bruker åpner lenken til profilen og logger inn", async () => {
        await innlogging.loggInnFraDyplenke(arbeidsflateProfil.url, user);
    });

    await test.step("Bruker er innlogget på profilen", async () => {
        await arbeidsflateProfil.assertLoggedIn();
    });
});
