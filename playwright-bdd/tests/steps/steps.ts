import { DataTable } from 'playwright-bdd';
import { Given, When, Then } from '../fixtures/app.fixtures';

const user = {
    pid: '13822649208', name: "Oransje Tyr",
};

let startArea: string;

Given('at bruker er innlogget på {string}', async ({ authFlow }, area: string) => {
    await authFlow.navigateToArea(area);
    await authFlow.login(user);
    await authFlow.checkLoggedIn(area, user);
});

Given('at bruker går til {string} uten å være logget inn', async ({ authFlow, page }, area: string) => {
    startArea = area;
    await authFlow.navigateToArea(area);
    await page.waitForTimeout(2000);
});

When('bruker logger inn', async ({ authFlow, page }) => {
    await authFlow.login(user);
    await page.waitForTimeout(2000);
});

Then('skal bruker være innlogget på {string}', async ({ authFlow, page }, area: string) => {
    await authFlow.checkLoggedIn(area, user);
    await page.waitForTimeout(2000);
});

When('bruker navigerer til andre områder skal bruker fortsatt være innlogget:', async ({ authFlow, page }, dataTable: DataTable) => {
    const rows = dataTable.hashes();
    const allAreas = rows.map((r: any) => r.område);
    // filtrer bort startområdet
    const otherAreas = allAreas.filter((a) => a !== startArea);

    for (const area of otherAreas) {
        await authFlow.navigateToAreaAndVerify(area);
        await authFlow.checkLoggedIn(area, user);
        await page.waitForTimeout(2000);
    }
});

When('logger ut igjen', async ({ authFlow, page }) => {
    await authFlow.logout(startArea);
    await page.waitForTimeout(2000);
});

Then('skal bruker være utlogget på alle områder:', async ({ authFlow, page }, dataTable: DataTable) => {
    const rows = dataTable.hashes();
    const allAreas = rows.map((r: any) => r.område);

    // filtrer bort startområdet
    const otherAreas = allAreas.filter((a) => a !== startArea);

    for (const area of otherAreas) {
        await authFlow.navigateToAreaAndVerify(area);
        await authFlow.checkLoggedOut(area);
        await page.waitForTimeout(2000);
    }
});

Then('skal bruker være innlogget på {string} også etter refresh', async ({ authFlow, page }, area: string) => {
    await authFlow.checkLoggedIn(area, user);
    await page.waitForTimeout(2000);
    await page.reload();
    await authFlow.checkLoggedIn(area, user);
});

When('bruker navigerer til andre områder skal bruker fortsatt være innlogget også etter refresh:', async ({ authFlow, page }, dataTable: DataTable) => {
    const rows = dataTable.hashes();
    const allAreas = rows.map((r: any) => r.område);

    // filtrer bort startområdet
    const otherAreas = allAreas.filter((a) => a !== startArea);

    for (const area of otherAreas) {
        await authFlow.navigateToAreaAndVerify(area);
        await authFlow.checkLoggedIn(area, user);
        await page.waitForTimeout(2000);
        await page.reload();
        await page.waitForTimeout(2000);
        await authFlow.checkLoggedIn(area, user);
    }
});

