export function getDefaultResourceBody(id, org, orgCode) {
  return {
    "identifier": id,
    "title": {
      "en": "Testing resource for digdir",
      "nb": "Testressurs for digdir",
      "nn": "Testressurs for digdir"
    },
    "description": {
      "en": "Testing resource for digdir",
      "nb": "Testressurs for digdir",
      "nn": "Testressurs for digdir"
    },
    "rightDescription": {
      "en": "Testing resource for digdir",
      "nb": "Testressurs for digdir",
      "nn": "Testressurs for digdir"
    },
    "homepage": "https://platform.at22.altinn.cloud/",
    "status": "Active",
    "contactPoints": [],
    "isPartOf": "Altinn",
    "resourceReferences": [],
    "delegable": false,
    "visible": false,
    "hasCompetentAuthority": {
      "name": {
        "en": "Digitaliseringsdirektoratet",
        "nb": "Digitaliseringsdirektoratet",
        "nn": "Digitaliseringsdirektoratet"
      },
      "organization": org,
      "orgcode": orgCode
    },
    "keywords": [],
    "accessListMode": "Disabled",
    "selfIdentifiedUserEnabled": false,
    "enterpriseUserEnabled": false,
    "resourceType": "GenericAccessResource",
    "authorizationReference": [
      {
        "id": "urn:altinn:resource",
        "value": id
      }
    ],
    "isOneTimeConsent": false,
    "versionId": 58
  } 
}

export function getDefaultPolicyXml(id) {
    const policyDefinition = {
        rules: [
            {
                effect: "Permit",
                description: "A rule giving the org 991825827 DIGITALISERINGSDIREKTORATET and 974761076 SKATTEETATEN access to publish/subscribe all events ",
                subjects: [
                    { id: "urn:altinn:organizationnumber", value: "991825827" },
                    { id: "urn:altinn:organizationnumber", value: "974761076" },
                    { id: "urn:altinn:org", value: "digdir" },
                    { id: "urn:altinn:org", value: "skd" },
                    { id: "urn:altinn:partyid", value: "50125678" },
                    { id: "urn:altinn:partyid", value: "50167512" },
                ],
                actions: ["publish", "subscribe"],
            },
            {
                effect: "Permit",
                description: "A rule giving PRIV, DAGL, INNH and LEDE access to read,write,sign,open",
                subjects: [
                    { id: "urn:altinn:rolecode", value: "PRIV" },
                    { id: "urn:altinn:rolecode", value: "DAGL" },
                    { id: "urn:altinn:rolecode", value: "INNH" },
                    { id: "urn:altinn:rolecode", value: "LEDE" },
                ],
                actions: ["read", "write", "sign", "open"],
            },
        ],
      //obligationExpressions: [
        // {
        //   obligationId: "urn:altinn:obligation:authenticationLevel1",
        //   fulfillOn: "Permit",
        //   attributeId: "urn:altinn:obligation1-assignment1",
        //   category: "urn:altinn:minimum-authenticationlevel",
        //   value: 3,
        // },{
        //   obligationId: "urn:altinn:obligation:authenticationLevel2",
        //   fulfillOn: "Permit",
        //   attributeId: "urn:altinn:obligation2-assignment2",
        //   category: "urn:altinn:minimum-authenticationlevel-org",
        //   value: 3,
        // },
      //],
  };
  return buildPolicy(policyDefinition, id);
}

export function buildPolicy(definition, id) {
  let policyXml = `<?xml version="1.0" encoding="utf-8"?>
  <xacml:Policy PolicyId="urn:altinn:policyid:1" Version="1.0" RuleCombiningAlgId="urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-overrides" xmlns:xacml="urn:oasis:names:tc:xacml:3.0:core:schema:wd-17">
    <xacml:Target/>`;
  let ruleId = 0
  for (const rule of definition.rules) {
    ruleId += 1;
    policyXml += `
      <xacml:Rule RuleId="urn:altinn:resource:${id}:ruleid:${ruleId}" Effect="${rule.effect}">
        <xacml:Description>${rule.description}</xacml:Description>
        <xacml:Target>
            <xacml:AnyOf>`;
        // add subjects
    for (const subject of rule.subjects) {
      policyXml += `
                <xacml:AllOf>
                    <xacml:Match MatchId="urn:oasis:names:tc:xacml:3.0:function:string-equal-ignore-case">
                        <xacml:AttributeValue DataType="http://www.w3.org/2001/XMLSchema#string">${subject.value}</xacml:AttributeValue>
                        <xacml:AttributeDesignator AttributeId="${subject.id}" Category="urn:oasis:names:tc:xacml:1.0:subject-category:access-subject" DataType="http://www.w3.org/2001/XMLSchema#string" MustBePresent="false"/>
                    </xacml:Match>
                </xacml:AllOf>`;
    }
    policyXml += `
            </xacml:AnyOf>`;
    policyXml += `
            <xacml:AnyOf>
                <xacml:AllOf>
                    <xacml:Match MatchId="urn:oasis:names:tc:xacml:1.0:function:string-equal">
                        <xacml:AttributeValue DataType="http://www.w3.org/2001/XMLSchema#string">${id}</xacml:AttributeValue>
                        <xacml:AttributeDesignator AttributeId="urn:altinn:resource" Category="urn:oasis:names:tc:xacml:3.0:attribute-category:resource" DataType="http://www.w3.org/2001/XMLSchema#string" MustBePresent="false"/>
                    </xacml:Match>
                </xacml:AllOf>
            </xacml:AnyOf>`;
    policyXml += `
            <xacml:AnyOf>`;
    for (const action of rule.actions) {
      policyXml += `
                <xacml:AllOf>
                    <xacml:Match MatchId="urn:oasis:names:tc:xacml:3.0:function:string-equal-ignore-case">
                        <xacml:AttributeValue DataType="http://www.w3.org/2001/XMLSchema#string">${action}</xacml:AttributeValue>
                        <xacml:AttributeDesignator AttributeId="urn:oasis:names:tc:xacml:1.0:action:action-id" Category="urn:oasis:names:tc:xacml:3.0:attribute-category:action" DataType="http://www.w3.org/2001/XMLSchema#string" MustBePresent="false"/>
                    </xacml:Match>
                </xacml:AllOf>`;
    }
    policyXml += `            
            </xacml:AnyOf>
        </xacml:Target>
    </xacml:Rule>`;
  }
  if (definition.obligationExpressions && definition.obligationExpressions.length > 0) {
    policyXml += `
    <xacml:ObligationExpressions>`

    for (const obligation of definition.obligationExpressions) {
      policyXml += `
          <xacml:ObligationExpression ObligationId="${obligation.obligationId}" FulfillOn="${obligation.fulfillOn}">
              <xacml:AttributeAssignmentExpression AttributeId="${obligation.attributeId}" Category="${obligation.category}">
                  <xacml:AttributeValue DataType="http://www.w3.org/2001/XMLSchema#integer">${obligation.value}</xacml:AttributeValue>
              </xacml:AttributeAssignmentExpression>
          </xacml:ObligationExpression>`;
    }
    policyXml += `
    </xacml:ObligationExpressions>`;
  }
  policyXml += `
  </xacml:Policy>`;
  return policyXml;
}