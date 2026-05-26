import { DataTable, test } from 'playwright-bdd';
import { Given, When, Then, TestContext } from '../fixtures/app.fixtures';
import { getAreasFromTable } from '../common-functions';

const user = {
    pid: '13822649208', name: "Oransje Tyr",
};

Given('at bruker er innlogget på {string}', async ({ authFlow, assertions }, area: string) => {
    await authFlow.navigateToArea(area);
    await authFlow.login(user);
    await assertions.checkLoggedIn(area, user);
});

Given('at bruker går til {string} uten å være logget inn', async ({ authFlow, testContext, page }, area: string) => {
    testContext.currentArea = area;
    await authFlow.navigateToArea(area);
    await page.waitForTimeout(2000);
});

When('bruker logger inn', async ({ authFlow, page }) => {
    await authFlow.login(user);
    await page.waitForTimeout(2000);
});

Then('skal bruker være innlogget på {string}', async ({ assertions, page }, area: string) => {
    await assertions.checkLoggedIn(area, user);
    await page.waitForTimeout(2000);
});

When('bruker navigerer til andre områder skal bruker fortsatt være innlogget:', async ({ assertions, authFlow, testContext, page }, dataTable: DataTable) => {
    for (const area of getAreasFromTable(dataTable, testContext.currentArea || '')) {
        await authFlow.navigateToAreaAndVerify(area);
        await assertions.checkLoggedIn(area, user);
        await page.waitForTimeout(2000);
    }
});

When('logger ut igjen', async ({ authFlow, testContext, page }) => {
    await authFlow.logout(testContext.currentArea || '');
    await page.waitForTimeout(2000);
});

Then('skal bruker være utlogget på alle områder:', async ({ authFlow, assertions, testContext, page }, dataTable: DataTable) => {
    for (const area of getAreasFromTable(dataTable, testContext.currentArea || '')) {
        await authFlow.navigateToAreaAndVerify(area);
        await assertions.checkLoggedOut(area);
        await page.waitForTimeout(2000);
    }
});

Then('skal bruker være innlogget på {string} også etter refresh', async ({ assertions, page }, area: string) => {
    await assertions.checkLoggedIn(area, user);
    await page.waitForTimeout(2000);
    await page.reload();
    await assertions.checkLoggedIn(area, user);
});

When('bruker navigerer til andre områder skal bruker fortsatt være innlogget også etter refresh:', async ({ authFlow, assertions, testContext, page }, dataTable: DataTable) => {
    for (const area of getAreasFromTable(dataTable, testContext.currentArea || '')) {
        await authFlow.navigateToAreaAndVerify(area);
        await assertions.checkLoggedIn(area, user);
        await page.waitForTimeout(2000);
        await page.reload();
        await page.waitForTimeout(2000);
        await assertions.checkLoggedIn(area, user);
    }
});

