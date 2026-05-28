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