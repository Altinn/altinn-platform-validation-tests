import { DataTable } from 'playwright-bdd';
import { Given, When, Then } from '../../fixtures/app.fixtures';
import { getAreasFromTable } from '../../common-functions';

const user = {
    pid: '13822649208', name: "Oransje Tyr",
};

Given('at bruker er innlogget på {string}', async ({ app }, area: string) => {
    await app.auth.navigateToAreaAndVerify(area);
    await app.auth.login(user);
    await app.assertions.checkLoggedIn(area, user);
});

Given('at bruker går til {string} uten å være logget inn', async ({ app }, area: string) => {
    app.testContext.currentArea = area;
    await app.auth.navigateToAreaAndVerify(area);
});

When('bruker logger inn', async ({ app }) => {
    await app.auth.login(user);
});

Then('skal bruker være innlogget på {string}', async ({ app }, area: string) => {
    await app.assertions.checkLoggedIn(area, user);
});

When('bruker navigerer til andre områder skal bruker fortsatt være innlogget:', async ({ app }, dataTable: DataTable) => {
    for (const area of getAreasFromTable(dataTable, app.testContext.currentArea || '')) {
        await app.auth.navigateToArea(area);
        await app.assertions.checkLoggedIn(area, user);
    }
});

When('logger ut igjen', async ({ app }) => {
    await app.auth.logout(app.testContext.currentArea || '');
    await app.auth.pause(5000); // Vent litt for å sikre at utloggingen er fullført før vi sjekker status på andre områder
});

Then('skal bruker være utlogget på alle områder:', async ({ app }, dataTable: DataTable) => {
    for (const area of getAreasFromTable(dataTable, app.testContext.currentArea || '')) {
        await app.auth.navigateToArea(area);
        await app.assertions.checkLoggedOut(area);
    }
});

Then('skal bruker være innlogget på {string} også etter refresh', async ({ app }, area: string) => {
    await app.assertions.checkLoggedIn(area, user);
    await app.auth.refresh();
    await app.assertions.checkLoggedIn(area, user);
});

When('bruker navigerer til andre områder skal bruker fortsatt være innlogget også etter refresh:', async ({ app }, dataTable: DataTable) => {
    for (const area of getAreasFromTable(dataTable, app.testContext.currentArea || '')) {
        await app.auth.navigateToArea(area);
        await app.assertions.checkLoggedIn(area, user);
        await app.auth.refresh();
        await app.assertions.checkLoggedIn(area, user);
    }
});

