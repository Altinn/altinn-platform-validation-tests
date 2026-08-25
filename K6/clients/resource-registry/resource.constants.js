/**
 * Resource types accepted by the resource registry. Serialized as strings.
 */
const ResourceType = Object.freeze({
    Default: "Default",
    Systemresource: "Systemresource",
    MaskinportenSchema: "MaskinportenSchema",
    Altinn2Service: "Altinn2Service",
    AltinnApp: "AltinnApp",
    GenericAccessResource: "GenericAccessResource",
    BrokerService: "BrokerService",
    CorrespondenceService: "CorrespondenceService",
    Consent: "Consent",
    MigratedApp: "MigratedApp",
});

/**
 * Access list modes for a resource.
 */
const ResourceAccessListMode = Object.freeze({
    Disabled: "Disabled",
    Enabled: "Enabled",
});

/**
 * Sources a resource reference can point into.
 */
const ReferenceSource = Object.freeze({
    Default: "Default",
    Altinn1: "Altinn1",
    Altinn2: "Altinn2",
    Altinn3: "Altinn3",
    ExternalPlatform: "ExternalPlatform",
});

/**
 * Kinds of resource references.
 */
const ReferenceType = Object.freeze({
    Default: "Default",
    Uri: "Uri",
    DelegationSchemeId: "DelegationSchemeId",
    MaskinportenScope: "MaskinportenScope",
    ServiceCode: "ServiceCode",
    ServiceEditionCode: "ServiceEditionCode",
    ApplicationId: "ApplicationId",
    ServiceEditionVersion: "ServiceEditionVersion",
});

/**
 * Party types a resource can be made available for.
 */
const ResourcePartyType = Object.freeze({
    PrivatePerson: "PrivatePerson",
    LegalEntityEnterprise: "LegalEntityEnterprise",
    Company: "Company",
    BankruptcyEstate: "BankruptcyEstate",
    SelfRegisteredUser: "SelfRegisteredUser",
});

/**
 * XACML attribute identifiers used for policy subjects.
 */
const SubjectAttribute = Object.freeze({
    RoleCode: "urn:altinn:rolecode",
    AccessPackage: "urn:altinn:accesspackage",
    Scope: "urn:scope",
});

export {
    ReferenceSource,
    ReferenceType,
    ResourceAccessListMode,
    ResourcePartyType,
    ResourceType,
    SubjectAttribute
};
