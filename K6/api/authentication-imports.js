// One import surface for the authentication v2 tests, so a test does not have to
// name every client, builder, building block and domain check it touches.
// Mirrors common-imports.js, which does the same for the versioned libraries.
//
// Re-exports are explicit rather than `export *`. A name exported by two modules
// is silently dropped by `export *` and only fails where it is used, while an
// explicit list fails here, where the collision actually is.
//
// Three rules keep this file from becoming a problem:
//
// 1. Nothing under clients/, building-blocks/ or domain-checks/ may import it.
//    Those import each other directly. A cycle through the barrel gives an error
//    that is hard to place.
// 2. One barrel per functional area and version. A shared v1 + v2 barrel would
//    drag the v1 graph into every v2 test and invite name collisions.
// 3. Nothing from domain-checks/common/ belongs here. Those are cross-area, so
//    two area barrels re-exporting PaginationDomainChecks would make a test that
//    imports both fail on a duplicate binding. Import them directly instead.

export { AuthenticationClient } from "../clients/authentication/authentication.js";
export {
    ChangeRequestSystemUserBuilder,
    ChangeRequestSystemUserClient,
    CreateAgentRequestSystemUserBuilder,
    CreateRequestSystemUserBuilder,
    IntrospectionClient,
    RegisterSystemRequestBuilder,
    RequestSystemUserClient,
    SystemRegisterClient,
    SystemUserClient,
    SystemUserClientDelegationClient,
} from "../clients/authentication/index.js";
export { SystemUserUpdateDtoBuilder } from "../clients/authentication/system-user.builders.js";
export { AuthenticationBuildingBlocks } from "./building-blocks/authentication/authentication/index.js";
export { ChangeRequestSystemUserBuildingBlocks } from "./building-blocks/authentication/change-request-system-user/index.js";
export { IntrospectionBuildingBlocks } from "./building-blocks/authentication/introspection/index.js";
export { RequestSystemUserBuildingBlocks } from "./building-blocks/authentication/request-system-user/index.js";
export { SystemRegisterBuildingBlocks } from "./building-blocks/authentication/system-register/index.js";
export { SystemUserBuildingBlocks } from "./building-blocks/authentication/system-user/index.js";
export { SystemUserClientDelegationBuildingBlocks } from "./building-blocks/authentication/system-user-client-delegation/index.js";
export { ChangeRequestSystemUserDomainChecks } from "./domain-checks/authentication/change-request-system-user.js";
export { IntrospectionDomainChecks } from "./domain-checks/authentication/introspection.js";
export { SystemRegisterDomainChecks } from "./domain-checks/authentication/system-register.js";
export { SystemUserDomainChecks } from "./domain-checks/authentication/system-user.js";
export { SystemUserClientDelegationDomainChecks } from "./domain-checks/authentication/system-user-client-delegation.js";
export { SystemUserRequestDomainChecks } from "./domain-checks/authentication/system-user-request.js";
export { TokenExchangeDomainChecks } from "./domain-checks/authentication/token-exchange.js";
