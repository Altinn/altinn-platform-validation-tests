import http from "k6/http";

import { SubjectAttribute } from "./resource.constants.js";
import { ResourceSearchQuery, ResourceType, ServiceResource, UpdatedResourceSubjectsQuery } from "./types.js";

/**
 * Builder for creating query parameters for searching resources.
 */
class ResourceSearchQueryBuilder {
    constructor() {
        this.query = /** @type {ResourceSearchQuery} */ ({
            Id: null,
            Title: null,
            Description: null,
            ResourceType: null,
            Keyword: null,
            Reference: null,
        });
    }

    /**
     * Sets resource identifier filter.
     *
     * @param {string} value Value to set.
     * @returns {ResourceSearchQueryBuilder} This builder, for chaining.
     */
    withId(value) {
        this.query.Id = value;

        return this;
    }

    /**
     * Sets title filter.
     *
     * @param {string} value Value to set.
     * @returns {ResourceSearchQueryBuilder} This builder, for chaining.
     */
    withTitle(value) {
        this.query.Title = value;

        return this;
    }

    /**
     * Sets description filter.
     *
     * @param {string} value Value to set.
     * @returns {ResourceSearchQueryBuilder} This builder, for chaining.
     */
    withDescription(value) {
        this.query.Description = value;

        return this;
    }

    /**
     * Sets resource type filter.
     *
     * @param {ResourceType} value Value to set.
     * @returns {ResourceSearchQueryBuilder} This builder, for chaining.
     */
    withResourceType(value) {
        this.query.ResourceType = value;

        return this;
    }

    /**
     * Sets keyword filter.
     *
     * @param {string} value Value to set.
     * @returns {ResourceSearchQueryBuilder} This builder, for chaining.
     */
    withKeyword(value) {
        this.query.Keyword = value;

        return this;
    }

    /**
     * Sets reference filter.
     *
     * @param {string} value Value to set.
     * @returns {ResourceSearchQueryBuilder} This builder, for chaining.
     */
    withReference(value) {
        this.query.Reference = value;

        return this;
    }

    /**
     * Builds the query object.
     *
     * @returns {ResourceSearchQuery} The result.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for creating query parameters for retrieving updated resources.
 */
class ResourceUpdatedQueryBuilder {
    constructor() {
        this.query = /** @type {UpdatedResourceSubjectsQuery} */ ({});
    }

    /**
     * Sets the date time used for filtering.
     *
     * @param {string} since Date time.
     * @returns {ResourceUpdatedQueryBuilder} This builder, for chaining.
     */
    since(since) {
        this.query.since = since;

        return this;
    }

    /**
     * Sets the continuation token.
     *
     * @param {string} token Continuation token.
     * @returns {ResourceUpdatedQueryBuilder} This builder, for chaining.
     */
    token(token) {
        this.query.token = token;

        return this;
    }

    /**
     * Sets the maximum number of pairs returned.
     *
     * @param {number} limit Maximum number of pairs.
     * @returns {ResourceUpdatedQueryBuilder} This builder, for chaining.
     */
    limit(limit) {
        this.query.limit = limit;

        return this;
    }

    /**
     * Returns the built query object.
     *
     * @returns {UpdatedResourceSubjectsQuery} The result.
     */
    build() {
        return this.query;
    }
}

/**
 * Builder for a ServiceResource payload.
 *
 * Nothing is filled in for you beyond the identifier, so the payload a test
 * sends is exactly the one the test spelled out. What the registry requires:
 * an identifier matching ^[a-z0-9_-]{4,}$, a resource type other than Default,
 * a competent authority (the organization number may only be left out for ttd),
 * title and description in nb, nn and en, right description in the same three
 * when the resource is delegable, and a MaskinportenScope resource reference
 * for a MaskinportenSchema resource.
 *
 * @example
 * const resource = new ServiceResourceBuilder("k6-test-resource")
 *     .withText("K6 test resource")
 *     .withResourceType(ResourceType.GenericAccessResource)
 *     .withCompetentAuthority("ttd")
 *     .withDelegable(false)
 *     .withVisible(false)
 *     .build();
 */
class ServiceResourceBuilder {
    /**
     * @param {string} identifier Resource identifier. Only a-z, 0-9, _ and -,
     * at least four characters.
     */
    constructor(identifier) {
        /**
         * The resource under construction.
         *
         * @type {ServiceResource}
         */
        this.resource = {
            identifier,
        };
    }

    /**
     * Sets title, description and right description to the same text in all
     * three required languages.
     *
     * @param {string} text Text to use.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withText(text) {
        this.resource.title = allLanguages(text);
        this.resource.description = allLanguages(text);
        this.resource.rightDescription = allLanguages(text);

        return this;
    }

    /**
     * Sets the title.
     *
     * @param {string|{[language: string]: string}} title Text for all three
     * required languages, or a per language object.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withTitle(title) {
        this.resource.title = typeof title === "string" ? allLanguages(title) : title;

        return this;
    }

    /**
     * Sets the description.
     *
     * @param {string|{[language: string]: string}} description Text for all three
     * required languages, or a per language object.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withDescription(description) {
        this.resource.description = typeof description === "string"
            ? allLanguages(description)
            : description;

        return this;
    }

    /**
     * Sets the right description, which the registry requires for delegable
     * resources.
     *
     * @param {string|{[language: string]: string}} rightDescription Text for all
     * three required languages, or a per language object.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withRightDescription(rightDescription) {
        this.resource.rightDescription = typeof rightDescription === "string"
            ? allLanguages(rightDescription)
            : rightDescription;

        return this;
    }

    /**
     * Sets the resource owner.
     *
     * @param {string} orgcode Service owner code, for instance ttd.
     * @param {string|null} [organization] Organization number. Required for
     * every service owner except ttd.
     * @param {string|{[language: string]: string}|null} [name] Owner name for all
     * three languages, or a per language object.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withCompetentAuthority(orgcode, organization = null, name = null) {
        this.resource.hasCompetentAuthority = {
            orgcode,
            organization,
            name: typeof name === "string" ? allLanguages(name) : name,
        };

        return this;
    }

    /**
     * Sets the resource type.
     *
     * @param {string} resourceType See ResourceType.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withResourceType(resourceType) {
        this.resource.resourceType = resourceType;

        return this;
    }

    /**
     * Sets whether the resource can be delegated.
     *
     * @param {boolean} delegable Whether the resource is delegable.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withDelegable(delegable) {
        this.resource.delegable = delegable;

        return this;
    }

    /**
     * Sets whether the resource is visible in the portal.
     *
     * @param {boolean} visible Whether the resource is visible.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withVisible(visible) {
        this.resource.visible = visible;

        return this;
    }

    /**
     * Sets which party types the resource is available for.
     *
     * @param {Array<string>} availableForType See ResourcePartyType.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withAvailableForType(availableForType) {
        this.resource.availableForType = availableForType;

        return this;
    }

    /**
     * Sets the access list mode.
     *
     * @param {string} accessListMode See ResourceAccessListMode.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withAccessListMode(accessListMode) {
        this.resource.accessListMode = accessListMode;

        return this;
    }

    /**
     * Adds a resource reference. MaskinportenSchema resources need one with
     * referenceType MaskinportenScope.
     *
     * @param {string} referenceSource See ReferenceSource.
     * @param {string} referenceType See ReferenceType.
     * @param {string} reference The reference value.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withResourceReference(referenceSource, referenceType, reference) {
        if (!this.resource.resourceReferences) {
            this.resource.resourceReferences = [];
        }

        this.resource.resourceReferences.push({
            referenceSource,
            referenceType,
            reference,
        });

        return this;
    }

    /**
     * Sets the resource status, for instance Completed.
     *
     * @param {string} status The status.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withStatus(status) {
        this.resource.status = status;

        return this;
    }

    /**
     * Adds a contact point.
     *
     * @param {{category?: string, email?: string, telephone?: string, contactPage?: string}} contactPoint The contact point.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withContactPoint(contactPoint) {
        if (!this.resource.contactPoints) {
            this.resource.contactPoints = [];
        }

        this.resource.contactPoints.push(contactPoint);

        return this;
    }

    /**
     * Sets the homepage.
     *
     * @param {string} homepage Homepage URL.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withHomepage(homepage) {
        this.resource.homepage = homepage;

        return this;
    }

    /**
     * Sets whether enterprise users get access.
     *
     * @param {boolean} enabled Whether enterprise users are enabled.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withEnterpriseUserEnabled(enabled) {
        this.resource.enterpriseUserEnabled = enabled;

        return this;
    }

    /**
     * Sets whether self identified users get access.
     *
     * @param {boolean} enabled Whether self identified users are enabled.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withSelfIdentifiedUserEnabled(enabled) {
        this.resource.selfIdentifiedUserEnabled = enabled;

        return this;
    }

    /**
     * Adds a keyword.
     *
     * @param {string} word The keyword.
     * @param {string} [language] Language code.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withKeyword(word, language = "nb") {
        if (!this.resource.keywords) {
            this.resource.keywords = [];
        }

        this.resource.keywords.push({ word, language });

        return this;
    }

    /**
     * Sets the resource version.
     *
     * @param {string} version The version.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withVersion(version) {
        this.resource.version = version;

        return this;
    }

    /**
     * Sets the spatial coverage.
     *
     * @param {Array<string>} spatial Spatial coverage.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withSpatial(spatial) {
        this.resource.spatial = spatial;

        return this;
    }

    /**
     * Sets what the resource produces.
     *
     * @param {Array<string>} produces What the resource produces.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withProduces(produces) {
        this.resource.produces = produces;

        return this;
    }

    /**
     * Sets the larger service this resource is part of.
     *
     * @param {string} isPartOf The larger service.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withIsPartOf(isPartOf) {
        this.resource.isPartOf = isPartOf;

        return this;
    }

    /**
     * Sets the thematic areas.
     *
     * @param {Array<string>} thematicAreas The thematic areas.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withThematicAreas(thematicAreas) {
        this.resource.thematicAreas = thematicAreas;

        return this;
    }

    /**
     * Adds an authorization reference attribute.
     *
     * @param {string} id Attribute identifier.
     * @param {string} value Attribute value.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withAuthorizationReference(id, value) {
        if (!this.resource.authorizationReference) {
            this.resource.authorizationReference = [];
        }

        this.resource.authorizationReference.push({ id, value });

        return this;
    }

    /**
     * Sets the consent template, for a Consent resource.
     *
     * @param {string} consentTemplate Consent template identifier.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withConsentTemplate(consentTemplate) {
        this.resource.consentTemplate = consentTemplate;

        return this;
    }

    /**
     * Sets the consent text, for a Consent resource.
     *
     * @param {string|{[language: string]: string}} consentText Text for all three
     * required languages, or a per language object.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withConsentText(consentText) {
        this.resource.consentText = typeof consentText === "string"
            ? allLanguages(consentText)
            : consentText;

        return this;
    }

    /**
     * Adds a consent metadata field, for a Consent resource.
     *
     * @param {string} key Metadata key.
     * @param {boolean} optional Whether the field is optional.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withConsentMetadata(key, optional) {
        if (!this.resource.consentMetadata) {
            this.resource.consentMetadata = {};
        }

        this.resource.consentMetadata[key] = { optional };

        return this;
    }

    /**
     * Sets whether the consent is one time only, for a Consent resource.
     *
     * @param {boolean} isOneTimeConsent Whether the consent is one time only.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    withIsOneTimeConsent(isOneTimeConsent) {
        this.resource.isOneTimeConsent = isOneTimeConsent;

        return this;
    }

    /**
     * Escape hatch for fields without a dedicated method, and for testing
     * payloads the other methods will not produce.
     *
     * @param {Partial<ServiceResource>} overrides Properties to set.
     * @returns {ServiceResourceBuilder} This builder, for chaining.
     */
    with(overrides) {
        this.resource = {
            ...this.resource,
            ...overrides,
        };

        return this;
    }

    /**
     * Builds the resource payload.
     *
     * @returns {ServiceResource} The result.
     */
    build() {
        return this.resource;
    }
}

/**
 * Builder for the XACML policy of a resource.
 *
 * Every rule permits a set of subjects a set of actions on the resource. The
 * resource match is derived from the resource identifier, which is what the
 * registry validates the policy against.
 *
 * @example
 * const policyFile = new XacmlPolicyBuilder("k6-test-resource")
 *     .withRule({ roles: ["DAGL"], actions: ["read", "write"] })
 *     .withMinimumAuthenticationLevel(3)
 *     .buildFile();
 */
class XacmlPolicyBuilder {
    /**
     * @param {string} resourceId Resource identifier the policy belongs to.
     */
    constructor(resourceId) {
        /**
         * Resource identifier the policy belongs to.
         */
        this.resourceId = resourceId;

        /**
         * Rules added so far.
         *
         * @type {Array<object>}
         */
        this.rules = [];

        /**
         * Minimum authentication level the policy requires. Stays null, and the
         * obligation is left out of the policy, until set.
         *
         * @type {number|null}
         */
        this.minimumAuthenticationLevel = null;
    }

    /**
     * Adds a permit rule.
     *
     * @param {object} rule The rule.
     * @param {Array<string>} [rule.roles] Altinn role codes that get access.
     * @param {Array<string>} [rule.accessPackages] Access packages that get access.
     * @param {Array<{attributeId: string, value: string}>} [rule.subjects] Subjects
     * expressed directly, for anything the two above do not cover.
     * @param {Array<string>} [rule.actions] Actions the subjects are permitted.
     * @param {string} [rule.description] Rule description.
     * @returns {XacmlPolicyBuilder} This builder, for chaining.
     */
    withRule({
        roles = [],
        accessPackages = [],
        subjects = [],
        actions = ["read"],
        description = null,
    }) {
        const allSubjects = [
            ...roles.map((value) => ({
                attributeId: SubjectAttribute.RoleCode,
                value,
            })),
            ...accessPackages.map((value) => ({
                attributeId: SubjectAttribute.AccessPackage,
                value,
            })),
            ...subjects,
        ];

        if (allSubjects.length === 0) {
            throw new Error(
                "XacmlPolicyBuilder: a rule needs at least one subject. Pass roles, accessPackages or subjects.",
            );
        }

        if (actions.length === 0) {
            throw new Error(
                "XacmlPolicyBuilder: a rule needs at least one action.",
            );
        }

        this.rules.push({
            subjects: allSubjects,
            actions,
            description,
        });

        return this;
    }

    /**
     * Sets the minimum authentication level obligation.
     *
     * @param {number|null} level Authentication level, or null to leave the
     * obligation out of the policy.
     * @returns {XacmlPolicyBuilder} This builder, for chaining.
     */
    withMinimumAuthenticationLevel(level) {
        this.minimumAuthenticationLevel = level;

        return this;
    }

    /**
     * Builds the policy as an XACML document.
     *
     * @returns {string} The policy XML.
     */
    build() {
        const id = this.resourceId;

        const rules = this.rules.map((rule, index) => buildRule(id, rule, index + 1));

        const obligations = this.minimumAuthenticationLevel === null
            ? ""
            : `  <xacml:ObligationExpressions>
    <xacml:ObligationExpression FulfillOn="Permit" ObligationId="urn:altinn:obligation:1">
      <xacml:AttributeAssignmentExpression AttributeId="urn:altinn:obligation-assignment:1" Category="urn:altinn:minimum-authenticationlevel">
        <xacml:AttributeValue DataType="http://www.w3.org/2001/XMLSchema#integer">${this.minimumAuthenticationLevel}</xacml:AttributeValue>
      </xacml:AttributeAssignmentExpression>
    </xacml:ObligationExpression>
  </xacml:ObligationExpressions>
`;

        return `<?xml version="1.0" encoding="utf-8"?>
<xacml:Policy xmlns:xsl="http://www.w3.org/2001/XMLSchema-instance" xmlns:xacml="urn:oasis:names:tc:xacml:3.0:core:schema:wd-17" PolicyId="urn:altinn:resource:${escapeXml(id)}:policyid:1" Version="1.0" RuleCombiningAlgId="urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-overrides">
  <xacml:Target/>
${rules.join("")}${obligations}</xacml:Policy>
`;
    }

    /**
     * Builds the policy as a file ready to post to the policy endpoint.
     *
     * @returns {*} XACML policy file created with http.file().
     */
    buildFile() {
        return http.file(this.build(), "policy.xml", "application/xml");
    }
}

/**
 * Repeats the same text for the three languages the registry requires.
 *
 * @param {string} text Text to repeat.
 * @returns {{[language: string]: string}} The result.
 */
function allLanguages(text) {
    return {
        nb: text,
        nn: text,
        en: text,
    };
}

/**
 * Escapes the characters that are not legal in XML text and attribute values.
 *
 * @param {string} value Value to escape.
 * @returns {string} The result.
 */
function escapeXml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * Builds a single XACML match element.
 *
 * @param {string} value Value to match.
 * @param {string} attributeId Attribute the value is matched against.
 * @param {string} category XACML attribute category.
 * @param {boolean} ignoreCase Whether the match ignores case.
 * @returns {string} The match element, wrapped in an AllOf.
 */
function buildMatch(value, attributeId, category, ignoreCase) {
    const matchId = ignoreCase
        ? "urn:oasis:names:tc:xacml:3.0:function:string-equal-ignore-case"
        : "urn:oasis:names:tc:xacml:1.0:function:string-equal";

    return `        <xacml:AllOf>
          <xacml:Match MatchId="${matchId}">
            <xacml:AttributeValue DataType="http://www.w3.org/2001/XMLSchema#string">${escapeXml(value)}</xacml:AttributeValue>
            <xacml:AttributeDesignator AttributeId="${escapeXml(attributeId)}" Category="${category}" DataType="http://www.w3.org/2001/XMLSchema#string" MustBePresent="false"/>
          </xacml:Match>
        </xacml:AllOf>
`;
}

/**
 * Builds a single XACML permit rule.
 *
 * @param {string} resourceId Resource identifier. Escaped by buildMatch, like
 * every other value that goes into the policy.
 * @param {object} rule Rule as collected by withRule().
 * @param {number} ruleNumber One based rule number, used in the rule id.
 * @returns {string} The rule element.
 */
function buildRule(resourceId, rule, ruleNumber) {
    const subjects = rule.subjects
        .map((subject) => buildMatch(
            subject.value,
            subject.attributeId,
            "urn:oasis:names:tc:xacml:1.0:subject-category:access-subject",
            true,
        ))
        .join("");

    const resources = buildMatch(
        resourceId,
        "urn:altinn:resource",
        "urn:oasis:names:tc:xacml:3.0:attribute-category:resource",
        false,
    );

    const actions = rule.actions
        .map((action) => buildMatch(
            action,
            "urn:oasis:names:tc:xacml:1.0:action:action-id",
            "urn:oasis:names:tc:xacml:3.0:attribute-category:action",
            false,
        ))
        .join("");

    const description = rule.description === null
        ? ""
        : `    <xacml:Description>${escapeXml(rule.description)}</xacml:Description>
`;

    return `  <xacml:Rule RuleId="urn:altinn:resource:${escapeXml(resourceId)}:ruleid:${ruleNumber}" Effect="Permit">
${description}    <xacml:Target>
      <xacml:AnyOf>
${subjects}      </xacml:AnyOf>
      <xacml:AnyOf>
${resources}      </xacml:AnyOf>
      <xacml:AnyOf>
${actions}      </xacml:AnyOf>
    </xacml:Target>
  </xacml:Rule>
`;
}

export {
    ResourceSearchQueryBuilder,
    ResourceUpdatedQueryBuilder,
    ServiceResourceBuilder,
    XacmlPolicyBuilder
};

