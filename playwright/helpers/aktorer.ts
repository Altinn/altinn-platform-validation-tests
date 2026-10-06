import { expect } from "@playwright/test";

import { ApiClient } from "../clients";
import { AuthorizedParty } from "../clients/access-management-bff/types";

/** Antallet aktører brukeren kan velge i headeren, slik den teller dem: hver aktør pluss undernivåene. */
export async function antallAktorer(api: ApiClient, token: string): Promise<number> {
    const response = await api.accessManagementBff.user.GetReporteeListForUser(token);
    expect(response.ok(), `Henting av aktørlisten: ${response.status()}`).toBe(true);

    const aktorer: AuthorizedParty[] = await response.json();
    return aktorer.reduce((sum, aktor) => sum + 1 + (aktor.subunits?.length ?? 0), 0);
}
