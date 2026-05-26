export function getFullUrl(area: string): string {
    switch (area) {
        case 'arbeidsflate':
            return process.env.AF_BASE_URL || 'https://af.at23.altinn.cloud';
        case 'arbeidsflate-profil':
            return process.env.AF_BASE_URL + "/profile" || 'https://af.at23.altinn.cloud/profile';
        case 'tilgangsstyring':
            return process.env.AM_UI_BASE_URL + "/accessmanagement/ui" || 'https://am.ui.at23.altinn.cloud/accessmanagement/ui';
        case 'infoportalen':
            return process.env.INFO_CLOUD_URL || 'https://info.at23.altinn.cloud';
        default:
            throw new Error(`Ukjent område: ${area}`);
    }
}