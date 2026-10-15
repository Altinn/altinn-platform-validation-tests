/**
 * Delt mellom serviceowner- og enduser-klienten: Dialogporten (og Altinns
 * autorisasjon generelt) identifiserer en part med en URN, ikke det rå
 * fødsels-/organisasjonsnummeret.
 */
export function party(partyId: string): string {
    return partyId.length === 11
        ? `urn:altinn:person:identifier-no:${partyId}`
        : `urn:altinn:organization:identifier-no:${partyId}`;
}

export function resource(resourceId: string): string {
    return `urn:altinn:resource:${resourceId}`;
}
