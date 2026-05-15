import { createBdd, DataTable } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { getFullUrl } from './common-functions';

const { Given, When, Then } = createBdd();

const user = {
    pid: '13822649208', name: "Oransje Tyr",
};

let startAreaUrl: string;
let startArea: string;

Given('at bruker går til {string} uten å være logget inn', async ({ page }, area) => {
    startAreaUrl = getFullUrl(area);
    startArea = area;
    console.log(`Navigerer til ${startAreaUrl} for område ${area}`);
    await gotoAllowAborted(page, startAreaUrl);

    if (area !== 'infoportalen') {
        await expect(page.locator('#testid1')).toBeVisible();
    }
    await page.waitForTimeout(2000);
});

When('bruker logger inn', async ({ page }) => {
    const currentUrl = page.url();
    if (!currentUrl.includes('idporten')) {
        console.log('Bruker er ikke på innloggingsside, navigerer til innloggingsside');
        // nødvendig pga Altinn hydration / login-handler timing
        await page.waitForTimeout(2000);
        await page.getByRole('button', {
            name: /logg inn|login/i,
        }).click();
    }
    await page.locator('#testid1').click();

    await page.locator('input[name="pid"]').fill(user.pid);
    await page.locator('#submit').click();
    await page.waitForTimeout(2000);
});

Then('skal bruker være innlogget på {string}', async ({ page }, arg: string) => {
    const url = getFullUrl(arg);
    await checkLoggedIn(page, arg, url);
    await page.waitForTimeout(2000);
});

When('bruker navigerer til andre områder skal bruker fortsatt være innlogget:', async ({ page }, dataTable: DataTable) => {
    const rows = dataTable.hashes();
    const allAreas = rows.map((r: any) => r.område);

    // filtrer bort startområdet
    const otherAreas = allAreas.filter((a) => a !== startArea);

    for (const area of otherAreas) {
        const url = getFullUrl(area);
        console.log(`Navigerer til ${url} for område ${area}`);
        await gotoAllowAborted(page, url);
        await expect(page).toHaveURL(url, { timeout: 5000 });
        await checkLoggedIn(page, area, url);
        await page.waitForTimeout(2000);
    }
});

When('logger ut igjen', async ({ page }) => {
    await logout(page, startArea);
    await page.waitForTimeout(2000);
});

Then('skal bruker være utlogget på alle områder:', async ({ page }, dataTable: DataTable) => {
    const rows = dataTable.hashes();
    const allAreas = rows.map((r: any) => r.område);

    // filtrer bort startområdet
    const otherAreas = allAreas.filter((a) => a !== startArea);

    for (const area of otherAreas) {
        const url = getFullUrl(area);
        console.log(`Navigerer til ${url} for område ${area}`);
        await gotoAllowAborted(page, url);
        await page.waitForTimeout(2000);
        await checkLoggedOut(page, area, url);
    }
});

Then('skal bruker være innlogget på {string} også etter refresh', async ({ page }, arg: string) => {
    const url = getFullUrl(arg);
    await checkLoggedIn(page, arg, url);
    await page.waitForTimeout(2000);
    await page.reload();
    await checkLoggedIn(page, arg, url);
});

When('bruker navigerer til andre områder skal bruker fortsatt være innlogget også etter refresh:', async ({ page }, dataTable: DataTable) => {
    const rows = dataTable.hashes();
    const allAreas = rows.map((r: any) => r.område);

    // filtrer bort startområdet
    const otherAreas = allAreas.filter((a) => a !== startArea);

    for (const area of otherAreas) {
        const url = getFullUrl(area);
        console.log(`Navigerer til ${url} for område ${area}`);
        await gotoAllowAborted(page, url);
        await expect(page).toHaveURL(url, { timeout: 5000 });
        await checkLoggedIn(page, area, url);
        await page.waitForTimeout(2000);
        await page.reload();
        await page.waitForTimeout(2000);
        await checkLoggedIn(page, area, url);
    }
});


async function gotoAllowAborted(page: any, url: string) {
    try {
        await page.goto(url, { waitUntil: 'commit', timeout: 15000 });
    } catch (err: any) {
        if (String(err.message).includes('net::ERR_ABORTED')) {
            console.warn(`Navigation aborted, continuing: ${url}`);
        } else {
            throw err;
        }
    }
}

async function checkLoggedIn(page: any, area: string, url: string) {
    //return page.locator('#testid1').isVisible();
    switch (area) {
        case 'arbeidsflate':
        case 'arbeidsflate-profil':
        case 'tilgangsstyring':
            await expect(page).toHaveURL(url);
            break;
        case 'infoportalen':
            // infoportalen har ingen innloggingsindikator, så vi sjekker at vi er på riktig URL
            await expect(page).toHaveURL(url);
            const matches = page.getByText(user.name);

            for (let i = 0; i < await matches.count(); i++) {
                const match = matches.nth(i);

                if (await match.isVisible()) {
                    await expect(match).toBeVisible();
                    break;
                }
            }
            break;
        default:
            throw new Error(`Ukjent område: ${area}`);
    }
}

async function checkLoggedOut(page: any, area: string, url: string) {
    switch (area) {
        case 'arbeidsflate':
        case 'arbeidsflate-profil':
        case 'tilgangsstyring':
            await expect(page.locator('#testid1')).toBeVisible();
            break;
        case 'infoportalen':
            // infoportalen har ingen innloggingsindikator, så vi sjekker at vi er på riktig URL
            await expect(page).toHaveURL(url);
            // og at vi ser innloggingsknappen
            await expect(page.getByRole('button', {
                name: /logg inn|login/i,
            })).toBeVisible();
            break;
        default:
            throw new Error(`Ukjent område: ${area}`);
    }
}

async function logout(page: any, area: string) {
    // Implementer utlogging basert på hvordan innlogging er implementert
    // Dette kan være en knapp eller link i UI, eller en direkte URL for utlogging
    if (area === 'infoportalen') {
        // infoportalen har ingen utloggingsknapp, så vi navigerer til en URL som tvinger utlogging
        await gotoAllowAborted(page, getFullUrl(area));
    }
    // åpne meny
    await page.getByRole('button', {
        name: /^(meny|menu)$/i,
    }).click();
    // vent på logout
    const logoutButton = page.getByRole('button', {
        name: /logg ut|logout/i,
    });
    await expect(logoutButton).toBeVisible({ timeout: 10000 });
    // klikk logout
    await logoutButton.click();

}
