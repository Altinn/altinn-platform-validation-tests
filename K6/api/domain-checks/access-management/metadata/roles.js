import { check } from "k6";

import { RoleDto } from "../../../../clients/access-management/metadata/roles/roles.types.js";

/**
 * Finds a role with the specified id in the provided roles array.
 *
 * @param {RoleDto[]|null} roles - Array of roles to search.
 * @param {string} id - The id of the role to find.
 * @returns {RoleDto|undefined} - The role with the specified id, or undefined if not found.
 */
function FindRole(roles, id) {
    return (roles ?? []).find((role) => role.id === id);
}

/**
 * @param {RoleDto|null} role - The role to check.
 * @param {string} expected - Expected id.
 * @returns {boolean} True if the role has the expected id.
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
 * @param {RoleDto|null} role - The role to check.
 * @param {string} expected - Expected name.
 * @returns {boolean} True if the role has the expected name.
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
 * @param {RoleDto|null} role - The role to check.
 * @param {string} expected - Expected code.
 * @returns {boolean} True if the role has the expected code.
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
 * @param {RoleDto|null} role - The role to check.
 * @param {boolean} expected - Expected isKeyRole value.
 * @returns {boolean} True if the role has the expected isKeyRole value.
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
 * @param {RoleDto|null} role - The role to check.
 * @param {string} expected - Expected URN.
 * @returns {boolean} True if the role has the expected URN.
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
 * @param {RoleDto|null} role - The role to check.
 * @param {string} expected - Expected legacy role code.
 * @returns {boolean} True if the role has the expected legacy role code.
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
 * @param {RoleDto|null} role - The role to check.
 * @param {string} expected - Expected legacy URN.
 * @returns {boolean} True if the role has the expected legacy URN.
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
 * @param {RoleDto|null} role - The role to check.
 * @param {string} expected - Expected provider code.
 * @returns {boolean} True if the role has the expected provider code.
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
 * @param {RoleDto|null} role - The role to check.
 * @param {string} expected - Expected provider name.
 * @returns {boolean} True if the role has the expected provider name.
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
