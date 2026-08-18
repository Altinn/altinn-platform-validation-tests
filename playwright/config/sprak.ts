/**
 * Språkene flatene støtter. Definert her fordi både page objects, fixtures og
 * tester trenger samme sett. Identifikatorene skrives uten æøå, verdiene ikke.
 */
export enum Sprak {
    Bokmaal = 'bokmål',
    Nynorsk = 'nynorsk',
    Engelsk = 'engelsk',
}

export const alleSprak = Object.values(Sprak);
