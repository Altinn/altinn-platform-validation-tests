import { expect } from "@playwright/test";

import { ApiClient } from "../clients";
import { SimpleInstance } from "../clients/apps/types";

/**
 * Hard-sletter alle aktive instanser eieren har av appen, ikke bare den en test opprettet,
 * så instanser fra en kjøring der oppryddingen feilet også blir borte.
 */
export async function slettAlleInstanser(api: ApiClient, token: string, app: string, partyId: string) {
    const response = await api.apps.instances.GetActiveInstances(token, app, partyId);
    expect(response.ok(), `Henting av aktive instanser for ${partyId}: ${response.status()}`).toBe(true);

    const instanser: SimpleInstance[] = await response.json();
    for (const { id } of instanser) {
        const [eier, guid] = id.split("/");
        const slett = await api.apps.instances.DeleteInstance(token, app, eier, guid, true);
        expect(slett.ok(), `Sletting av instans ${id}: ${slett.status()}`).toBe(true);
    }
}
