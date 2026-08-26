import { TestUser } from "../config/environment";

/**
 * Fellesnevneren for en side som kan nås direkte og som viser om brukeren er
 * innlogget. Innloggingsflyten og testene som går på tvers av flater trenger
 * bare dette.
 */
export interface Side {
    readonly url: string;
    navigateTo(): Promise<void>;
    assertLoggedIn(user: TestUser): Promise<void>;

    /**
     * Hva flaten viser en utlogget bruker. Flatene bak innlogging sender henne til
     * ID-porten, mens de åpne bare slutter å vise hvem hun er, så hver flate svarer
     * for sin egen del.
     */
    assertLoggedOut(user: TestUser): Promise<void>;
}
