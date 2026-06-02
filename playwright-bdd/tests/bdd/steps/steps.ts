import { DataTable } from 'playwright-bdd';
import { Given, When, Then } from '../../fixtures/app.fixtures';
import { getAreasFromTable } from '../../common-functions';

const user = {
    pid: '13822649208', name: "Oransje Tyr",
};

Given('at bruker er innlogget på {string}', async ({ app }, area: string) => {
    await app.auth.navigateToAreaAndVerifyOnLogin(area);
    await app.auth.login(user);
    await app.assertions.checkLoggedIn(area, user);
});

Given('at bruker går til {string} uten å være logget inn', async ({ app }, area: string) => {
    app.testContext.currentArea = area;
    await app.auth.navigateToAreaAndVerifyOnLogin(area);
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

When('bruker logger ut', async ({ app }) => {
    await app.auth.logout(app.testContext.currentArea || '');

});

Then('skal bruker være utlogget på infoportalen', async ({ app }) => {
    await app.assertions.checkLoggedOut("infoportalen");
    await app.auth.pause(2000); // legger inn en liten pause for å sikre at eventuelle asynkrone operasjoner er fullført før vi fortsetter testen
});

Then('fortsatt være utlogget når bruker går til område:', async ({ app }, dataTable: DataTable) => {
    for (const area of getAreasFromTable(dataTable, '')) {
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

