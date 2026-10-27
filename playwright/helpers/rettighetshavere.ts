import { expect } from "@playwright/test";

import { ApiClient } from "../clients";
import { Connection } from "../clients/access-management-bff/types";

/** Party UUID-en til rettighetshaveren `navn` hos `fra`, slått opp i BFF-en til Tilgangsstyring. */
export async function rettighetshaverUuid(api: ApiClient, token: string, fra: string, navn: string): Promise<string> {
    const response = await api.accessManagementBff.connection.GetRightholders(token, { party: fra, from: fra });
    expect(response.ok(), `Henting av rettighetshavere hos ${fra}: ${response.status()}`).toBe(true);

    const rettighetshavere: Connection[] = await response.json();
    const treff = rettighetshavere.find((r) => r.party.name.toUpperCase() === navn.toUpperCase());
    expect(treff, `${navn} er rettighetshaver hos ${fra}`).toBeDefined();
    return treff!.party.id;
}
