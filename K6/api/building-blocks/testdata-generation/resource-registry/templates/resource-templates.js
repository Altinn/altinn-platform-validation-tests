/*
* Returns a resource body based on the provided templateId.
* Used for creating resources in the Resource Registry for testing purposes.
* Create other templates as needed by modifying or adding to the definitions below.
*/
export function getResourceBody(templateId, id, org, orgCode, accessPackage=null) {
    switch (templateId) {
        case "access-package":
            return accessPackageTemplate(id, org, orgCode, accessPackage);
        case "access-package-with-priv":
            return accessPackageTemplate(id, org, orgCode, accessPackage, true);
        default:
            return getDefaultResourceBody(id, org, orgCode);
    }
}

function getDefaultResourceBody(id, org, orgCode) {
    return {
        "identifier": id,
        "title": {
            "en": `Testing resource for ${orgCode}`,
            "nb": `Testressurs for ${orgCode}`,
            "nn": `Testressurs for ${orgCode}`
        },
        "description": {
            "en": `Generic test resource for ${orgCode}`,
            "nb": `Generisk testressurs for ${orgCode}`,
            "nn": `Generisk testressurs for ${orgCode}`,
        },
        "rightDescription": {
            "en": `Generic test resource for ${orgCode}, check policy-file for rights`,
            "nb": `Generisk testressurs for ${orgCode}, sjekk policy-fil for rettigheter`,
            "nn": `Generisk testressurs for ${orgCode}, sjekk policy-fil for rettigheter`,
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
                "en": "Test department",
                "nb": "testdepartementet",
                "nn": "Testdepartementet"
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
    }; 
}

function accessPackageTemplate(id, org, orgCode, accessPackage, withPriv=false) {
    let withPrivText = withPriv ? " + PRIV" : "";
    return {
        "identifier": id,
        "version": "1",
        "title": {
            "en": `Testing resource for ${orgCode}`,
            "nb": `Testressurs for ${orgCode}`,
            "nn": `Testressurs for ${orgCode}`
        },
        "description": {
            "en": `Generic test resource for ${orgCode} on access package ${accessPackage}${withPrivText}`,
            "nb": `Generisk testressurs for ${orgCode} på tilgangspakke ${accessPackage}${withPrivText}`,
            "nn": `Generisk testressurs for ${orgCode} på tilgangspakke ${accessPackage}${withPrivText}`,
        },
        "rightDescription": {
            "en": `Read, write and access on access package ${accessPackage}${withPrivText}`,
            "nb": `Read, write and access på tilgangspakke ${accessPackage}${withPrivText}`,
            "nn": `Read, write and access på tilgangspakke ${accessPackage}${withPrivText}`,
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
                "en": "Test department",
                "nb": "testdepartementet",
                "nn": "Testdepartementet"
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
    };
}
