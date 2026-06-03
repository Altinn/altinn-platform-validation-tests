import { DataTable } from 'playwright-bdd';
import { Given, When, Then } from '../../../fixtures/app.fixture';
import { getAreasFromTable } from '../../common-functions';

const user = {
    pid: '13822649208', name: "Oransje Tyr",
};

Given('at bruker er innlogget på {string}', async ({ app }, area: string) => {
    await app.ssoFlow.navigateToAreaAndVerifyOnLogin(area);
    await app.ssoFlow.login(user);
    await app.ssoFlow.checkLoggedIn(area, user);
});

Given('at bruker går til {string} uten å være logget inn', async ({ app }, area: string) => {
    app.testContext.currentArea = area;
    await app.ssoFlow.navigateToAreaAndVerifyOnLogin(area);
});

When('bruker logger inn', async ({ app }) => {
    await app.ssoFlow.login(user);
});

Then('skal bruker være innlogget på {string}', async ({ app }, area: string) => {
    await app.ssoFlow.checkLoggedIn(area, user);
});

When('bruker navigerer til andre områder skal bruker fortsatt være innlogget:', async ({ app }, dataTable: DataTable) => {
    for (const area of getAreasFromTable(dataTable, app.testContext.currentArea || '')) {
        await app.ssoFlow.navigateToArea(area);
        await app.ssoFlow.checkLoggedIn(area, user);
    }
});

When('bruker logger ut', async ({ app }) => {
    await app.ssoFlow.logout(app.testContext.currentArea || '');
});

Then('skal bruker være utlogget på infoportalen', async ({ app }) => {
    await app.ssoFlow.checkLoggedOut("infoportalen");
    await app.ssoFlow.pause(2000); // legger inn en liten pause for å sikre at eventuelle asynkrone operasjoner er fullført før vi fortsetter testen
});

Then('fortsatt være utlogget når bruker går til område:', async ({ app }, dataTable: DataTable) => {
    for (const area of getAreasFromTable(dataTable, '')) {
        await app.ssoFlow.navigateToArea(area);
        await app.ssoFlow.checkLoggedOut(area);
    }
});

Then('skal bruker være innlogget på {string} også etter refresh', async ({ app }, area: string) => {
    await app.ssoFlow.checkLoggedIn(area, user);
    await app.ssoFlow.refresh();
    await app.ssoFlow.checkLoggedIn(area, user);
});

When('bruker navigerer til andre områder skal bruker fortsatt være innlogget også etter refresh:', async ({ app }, dataTable: DataTable) => {
    for (const area of getAreasFromTable(dataTable, app.testContext.currentArea || '')) {
        await app.ssoFlow.navigateToArea(area);
        await app.ssoFlow.checkLoggedIn(area, user);
        await app.ssoFlow.refresh();
        await app.ssoFlow.checkLoggedIn(area, user);
    }
});
