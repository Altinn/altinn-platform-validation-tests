import { DataTable } from "playwright-bdd";

export function getFullUrl(area: string): string {
    switch (area) {

        case 'arbeidsflate':
            return process.env.AF_BASE_URL
                || 'https://af.tt02.altinn.no';

        case 'arbeidsflate-profil':
            return (
                process.env.AF_BASE_URL
                    ? `${process.env.AF_BASE_URL}/profile`
                    : 'https://af.tt02.altinn.no/profile'
            );

        case 'tilgangsstyring':
            return (
                process.env.AM_UI_BASE_URL
                    ? `${process.env.AM_UI_BASE_URL}/accessmanagement/ui`
                    : 'https://am.ui.tt02.altinn.no/accessmanagement/ui'
            );

        case 'infoportalen':
            return process.env.INFO_CLOUD_URL
                || 'https://info.tt02.altinn.no';

        default:
            throw new Error(`Ukjent område: ${area}`);
    }
}
export function getAreasFromTable(dataTable: DataTable, area: string): string[] {
    const rows = dataTable.hashes();
    return rows.map((r: any) => r.område).filter((a: string) => a !== area);
}