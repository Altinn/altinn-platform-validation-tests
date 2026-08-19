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
}
