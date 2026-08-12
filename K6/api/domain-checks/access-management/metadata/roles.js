import { check } from "k6";

/**
 * @typedef {{ id: string, name: string, code: string, isKeyRole: boolean, urn: string, legacyRoleCode: string, legacyUrn: string, provider: { code: string, name: string } }} RoleDto
 */

/**
 * @param {RoleDto[]} roles
 * @param {string} id
 * @returns {RoleDto|undefined}
 */
function FindRole(roles, id) {
    return (roles ?? []).find((role) => role.id === id);
}

/**
 * @param {RoleDto} role
 * @param {string} expected
 * @returns {boolean}
 */
function CheckRoleId(role, expected) {
    const success = check(role, {
        "CheckRoleId - Role has expected id": (r) => r?.id === expected,
    });

    if (!success) {
        console.error(`CheckRoleId - expected '${expected}', got '${role?.id}'`);
    }

    return success;
}

/**
 * @param {RoleDto} role
 * @param {string} expected
 * @returns {boolean}
 */
function CheckRoleName(role, expected) {
    const success = check(role, {
        "CheckRoleName - Role has expected name": (r) => r?.name === expected,
    });

    if (!success) {
        console.error(`CheckRoleName - expected '${expected}', got '${role?.name}'`);
    }

    return success;
}

/**
 * @param {RoleDto} role
 * @param {string} expected
 * @returns {boolean}
 */
function CheckRoleCode(role, expected) {
    const success = check(role, {
        "CheckRoleCode - Role has expected code": (r) => r?.code === expected,
    });

    if (!success) {
        console.error(`CheckRoleCode - expected '${expected}', got '${role?.code}'`);
    }

    return success;
}

/**
 * @param {RoleDto} role
 * @param {boolean} expected
 * @returns {boolean}
 */
function CheckRoleIsKeyRole(role, expected) {
    const success = check(role, {
        "CheckRoleIsKeyRole - Role has expected isKeyRole": (r) => r?.isKeyRole === expected,
    });

    if (!success) {
        console.error(`CheckRoleIsKeyRole - expected '${expected}', got '${role?.isKeyRole}'`);
    }

    return success;
}

/**
 * @param {RoleDto} role
 * @param {string} expected
 * @returns {boolean}
 */
function CheckRoleUrn(role, expected) {
    const success = check(role, {
        "CheckRoleUrn - Role has expected urn": (r) => r?.urn === expected,
    });

    if (!success) {
        console.error(`CheckRoleUrn - expected '${expected}', got '${role?.urn}'`);
    }

    return success;
}

/**
 * @param {RoleDto} role
 * @param {string} expected
 * @returns {boolean}
 */
function CheckRoleLegacyRoleCode(role, expected) {
    const success = check(role, {
        "CheckRoleLegacyRoleCode - Role has expected legacyRoleCode": (r) => r?.legacyRoleCode === expected,
    });

    if (!success) {
        console.error(`CheckRoleLegacyRoleCode - expected '${expected}', got '${role?.legacyRoleCode}'`);
    }

    return success;
}

/**
 * @param {RoleDto} role
 * @param {string} expected
 * @returns {boolean}
 */
function CheckRoleLegacyUrn(role, expected) {
    const success = check(role, {
        "CheckRoleLegacyUrn - Role has expected legacyUrn": (r) => r?.legacyUrn === expected,
    });

    if (!success) {
        console.error(`CheckRoleLegacyUrn - expected '${expected}', got '${role?.legacyUrn}'`);
    }

    return success;
}

/**
 * @param {RoleDto} role
 * @param {string} expected
 * @returns {boolean}
 */
function CheckRoleProviderCode(role, expected) {
    const success = check(role, {
        "CheckRoleProviderCode - Role has expected provider.code": (r) => r?.provider?.code === expected,
    });

    if (!success) {
        console.error(`CheckRoleProviderCode - expected '${expected}', got '${role?.provider?.code}'`);
    }

    return success;
}

/**
 * @param {RoleDto} role
 * @param {string} expected
 * @returns {boolean}
 */
function CheckRoleProviderName(role, expected) {
    const success = check(role, {
        "CheckRoleProviderName - Role has expected provider.name": (r) => r?.provider?.name === expected,
    });

    if (!success) {
        console.error(`CheckRoleProviderName - expected '${expected}', got '${role?.provider?.name}'`);
    }

    return success;
}

export const RolesDomainChecks = {
    FindRole,
    CheckRoleId,
    CheckRoleName,
    CheckRoleCode,
    CheckRoleIsKeyRole,
    CheckRoleUrn,
    CheckRoleLegacyRoleCode,
    CheckRoleLegacyUrn,
    CheckRoleProviderCode,
    CheckRoleProviderName,
};
