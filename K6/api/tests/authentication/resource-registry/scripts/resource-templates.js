/*
* Returns a resource body based on the provided templateId.
* Used for creating resources in the Resource Registry for testing purposes.
* Create other templates as needed by modifying or adding to the definitions below.
*/
export function getResourceBody(templateId, id, org, orgCode) {
  switch (templateId) {
    case 'access-package':
      return accessPackageTemplate(id, org, orgCode);
    default:
      return getDefaultResourceBody(id, org, orgCode);
  }
}

function getDefaultResourceBody(id, org, orgCode) {
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

function accessPackageTemplate(id, org, orgCode) {
    return {
        "identifier": id,
        "version": "versjon 1",
        "title": {
            "en": "Testing resource for digdir",
            "nb": "Testressurs for digdir",
            "nn": "Testressurs for digdir"
        },
        "description": {
            "en": "Updated description in English",
            "nb": "Oppdatert beskrivelse på norsk",
            "nn": "Testressurs for digdir"
        },
        "rightDescription": {
            "en": "Testing resource for digdir",
            "nb": "Testressurs for digdir",
            "nn": "Testressurs for digdir"
        },
        "homepage": "https://platform.at22.altinn.cloud/",
        "status": "Completed",
        "contactPoints": [
            {
                "category": "Chat med oss",
                "email": "",
                "telephone": "",
                "contactPage": "Slack testsenter"
            }
        ],
        "delegable": true,
        "visible": true,
        "hasCompetentAuthority": {
            "name": {
                "en": "Digitaliseringsdirektoratet",
                "nb": "Digitaliseringsdirektoratet",
                "nn": "Digitaliseringsdirektoratet"
            },
            "organization": org,
            "orgcode": orgCode
        },
        "keywords": [
            {
                "word": "testsenter",
                "language": "nb"
            }
        ],
        "accessListMode": "Disabled",
        "selfIdentifiedUserEnabled": true,
        "enterpriseUserEnabled": false,
        "resourceType": "GenericAccessResource",
        "availableForType": [
            "PrivatePerson",
            "SelfRegisteredUser"
        ],
        "isOneTimeConsent": false,
        "versionId": 323
    }
}