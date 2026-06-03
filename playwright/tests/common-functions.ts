import { Page } from "@playwright/test";
import { DataTable } from "playwright-bdd";

const afBase =
    process.env.AF_BASE_URL
    || 'https://af.at23.altinn.cloud';

const amBase =
    process.env.AM_UI_BASE_URL
    || 'https://am.ui.at23.altinn.cloud';

const infoBase =
    process.env.INFO_CLOUD_URL
    || 'https://info.at23.altinn.cloud';

export function getFullUrl(area: string): string {

    switch (area) {

        case 'arbeidsflate':
            return afBase;

        case 'arbeidsflate-profil':
            return `${afBase}/profile`;

        case 'tilgangsstyring':
            return `${amBase}/accessmanagement/ui`;

        case 'infoportalen':
            return infoBase;

        default:
            throw new Error(`Ukjent område: ${area}`);
    }
}

export function getAreasFromTable(dataTable: DataTable, area: string): string[] {
    const rows = dataTable.hashes();
    return rows.map((r: any) => r.område).filter((a: string) => a !== area);
}

export async function gotoAllowAborted(page: any, url: string) {
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch (err: any) {
        if (String(err.message).includes('net::ERR_ABORTED')) {
            console.warn(`Navigation aborted, continuing: ${url}`);
        } else {
            throw err;
        }
    }
}

export async function gotoWithRetry(
    page: Page,
    url: string,
    maxAttempts = 3
): Promise<void> {

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {

        try {

            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 15000,
            });

            return;

        } catch (error) {

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            if (!message.includes('net::ERR_ABORTED')) {
                throw error;
            }

            lastError = error;

            console.warn(
                `Navigation aborted (${attempt}/${maxAttempts}): ${url}`
            );

            if (attempt < maxAttempts) {
                await page.waitForTimeout(1000);
            }
        }
    }

    throw new Error(`Navigation to ${url} failed after ${maxAttempts} attempts: ${lastError}`);
}