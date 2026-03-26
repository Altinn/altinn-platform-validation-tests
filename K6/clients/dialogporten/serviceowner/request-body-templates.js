import crypto from "k6/crypto";

function hex2(b) {
    return b.toString(16).padStart(2, "0");
}

/**
 * uuidv7 implmentation copied from the altinn/dialogporten repo
 */
function uuidv7() {
    // Date.now() is < 2^53, so integer math via division is safe/precise here.
    const ts = Date.now();

    // 16 bytes UUID
    const bytes = new Uint8Array(16);

    // Write 48-bit timestamp (big-endian) into bytes[0..5]
    bytes[0] = Math.floor(ts / 1099511627776) & 0xff; // 2^40
    bytes[1] = Math.floor(ts / 4294967296) & 0xff;    // 2^32
    bytes[2] = Math.floor(ts / 16777216) & 0xff;      // 2^24
    bytes[3] = Math.floor(ts / 65536) & 0xff;         // 2^16
    bytes[4] = Math.floor(ts / 256) & 0xff;           // 2^8
    bytes[5] = ts & 0xff;

    // Fill remaining 10 bytes with randomness (k6: randomBytes returns ArrayBuffer)
    const rnd = new Uint8Array(crypto.randomBytes(10));
    bytes.set(rnd, 6);

    // Set UUID version to 7 (high nibble of byte 6)
    bytes[6] = (bytes[6] & 0x0f) | 0x70;

    // Set RFC4122 variant (10xxxxxx) (byte 8)
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    // Format as canonical UUID: 8-4-4-4-12
    const hex =
        hex2(bytes[0]) + hex2(bytes[1]) + hex2(bytes[2]) + hex2(bytes[3]) +
        hex2(bytes[4]) + hex2(bytes[5]) + hex2(bytes[6]) + hex2(bytes[7]) +
        hex2(bytes[8]) + hex2(bytes[9]) + hex2(bytes[10]) + hex2(bytes[11]) +
        hex2(bytes[12]) + hex2(bytes[13]) + hex2(bytes[14]) + hex2(bytes[15]);

    return (
        hex.slice(0, 8) + "-" +
        hex.slice(8, 12) + "-" +
        hex.slice(12, 16) + "-" +
        hex.slice(16, 20) + "-" +
        hex.slice(20, 32)
    );
}

/**
 * 
 * @param {string} partyId - either a pid/ssn (11 digits) or an org number (9 digits)
 * @param {string} serviceResource - the service resource
 * @param {string} serviceOwner - the org number of the service owner
 * @returns json object to be used as body when creating a dialog via the API. 
 */
export function getDialogBody(partyId, serviceResource, serviceOwner) {
    // The partyId can be either a pid/ssn (11 digits) or an org number (9 digits). We determine which one it is based on the length of the string, and construct the party urn accordingly.
    // For a pid/ssn, the urn should be in the format urn:altinn:person:identifier-no:{pid}, and for an org number, it should be urn:altinn:organization:identifier-no:{orgnr}
    let party = null;
    if (partyId.length == 11) {
        party = `urn:altinn:person:identifier-no:${partyId}`;
    } else {
        party = `urn:altinn:organization:identifier-no:${partyId}`;
    }
    return {
        "serviceResource": `urn:altinn:resource:${serviceResource}`, // urn starting with urn:altinn:resource:
        "party": party,
        "status": "notApplicable", // valid values: notApplicable, inprogress, draft, awaiting, equiresAttention, completed
        "extendedStatus": "urn:any/valid/uri",
        "dueAt": "2033-11-25T06:37:54.2920190Z", // must be UTC
        "expiresAt": "2053-11-25T06:37:54.2920190Z", // must be UTC
        //"visibleFrom": new Date(Date.now() + 5000).toISOString(), // must be UTC
        "process": "urn:test:process:1",
        "serviceOwnerContext": {
            "serviceOwnerLabels": [
                { "value": "dialogporten-performance-sentinel" } // Do not remove this, this is used to look for unpurged dialogs after a run
            ]
        },
        "searchTags": [
            { "value": "something searchable" },
            { "value": "something else searchable" }
        ],
        "content": {
            "Title": {
                "value": [{ "languageCode": "nb", "value": "Skjema for rapportering av et eller annet" }]
            },
            "SenderName": {
                "value": [{ "languageCode": "nb", "value": "Avsendernavn" }]
            },
            "Summary": {
                "value": [{ "languageCode": "nb", "value": "Et sammendrag her. Maks 200 tegn, ingen HTML-støtte. Påkrevd. Vises i liste." }]
            },
            "AdditionalInfo": {
                "mediaType": "text/plain",
                "value": [{ "languageCode": "nb", "value": "Utvidet forklaring (enkel HTML-støtte, inntil 1023 tegn). Ikke påkrevd. Vises kun i detaljvisning." }]
            },
            "ExtendedStatus": {
                "value": [{ "languageCode": "nb", "value": "Utvidet Status" }]
            },
        },
        "transmissions": [
            {
                "type": "Information",
                "authorizationAttribute": "element1",
                "sender": {
                    "actorType": "serviceOwner",
                },
                "attachments": [
                    {
                        "displayName": [
                            {
                                "languageCode": "nb",
                                "value": "Forsendelse visningsnavn"
                            },
                            {
                                "languageCode": "en",
                                "value": "Transmission attachment display name"
                            }
                        ],
                        "urls": [
                            {
                                "url": "https://digdir.apps.tt02.altinn.no/some-other-url",
                                "consumerType": "Gui"
                            }
                        ]
                    }
                ],
                "content": {
                    "title": {
                        "value": [
                            {
                                "languageCode": "nb",
                                "value": "Forsendelsestittel"
                            },
                            {
                                "languageCode": "en",
                                "value": "Transmission title"
                            }
                        ]
                    },
                    "summary": {
                        "value": [
                            {
                                "languageCode": "nb",
                                "value": "Forsendelse oppsummering"
                            },
                            {
                                "languageCode": "en",
                                "value": "Transmission summary"
                            }
                        ]
                    }
                }
            },
            {
                "type": "Information",
                "sender": {
                    "actorType": "serviceOwner"
                },
                "attachments": [
                    {
                        "displayName": [
                            {
                                "languageCode": "nb",
                                "value": "Visningsnavn for forsendelsesvedlegg "
                            },
                            {
                                "languageCode": "en",
                                "value": "Transmission attachment display name"
                            }
                        ],
                        "urls": [
                            {
                                "url": "https://digdir.apps.tt02.altinn.no/some-other-url",
                                "consumerType": "Gui"
                            }
                        ]
                    }
                ],
                "content": {
                    "title": {
                        "value": [
                            {
                                "languageCode": "nb",
                                "value": "Forsendelsesstittel"
                            },
                            {
                                "languageCode": "en",
                                "value": "Transmission title"
                            }
                        ]
                    },
                    "summary": {
                        "value": [
                            {
                                "languageCode": "nb",
                                "value": "Transmisjon oppsummering"
                            },
                            {
                                "languageCode": "en",
                                "value": "Transmission summary"
                            }
                        ]
                    }
                }
            },
            {
                "type": "Information",
                "authorizationAttribute": "elementius",
                "sender": {
                    "actorType": "serviceOwner"
                },
                "attachments": [
                    {
                        "displayName": [
                            {
                                "languageCode": "nb",
                                "value": "Visningsnavn for forsendelsesvedlegg"
                            },
                            {
                                "languageCode": "en",
                                "value": "Transmission attachment display name"
                            }
                        ],
                        "urls": [
                            {
                                "url": "https://digdir.apps.tt02.altinn.no/some-other-url",
                                "consumerType": "Gui"
                            }
                        ]
                    }
                ],
                "content": {
                    "title": {
                        "value": [
                            {
                                "languageCode": "nb",
                                "value": "Forsendelsetittel"
                            },
                            {
                                "languageCode": "en",
                                "value": "Transmission title"
                            }
                        ]
                    },
                    "summary": {
                        "value": [
                            {
                                "languageCode": "nb",
                                "value": "Forsendelsesoppsummering"
                            },
                            {
                                "languageCode": "en",
                                "value": "Transmission summary"
                            }
                        ]
                    }
                }
            }
        ],
        "guiActions": [
            {
                "action": "read",
                "url": "https://digdir.no",
                "priority": "Primary",
                "title": [
                    {
                        "value": "Gå til dialog",
                        "languageCode": "nb"
                    }
                ]
            },
            {
                "action": "read",
                "url": "https://digdir.no",
                "priority": "Secondary",
                "httpMethod": "POST",
                "title": [
                    {
                        "value": "Utfør handling uten navigasjon",
                        "languageCode": "nb"
                    }
                ],
                "prompt": [{ "value": "Er du sikker?", "languageCode": "nb" }]
            }
        ],
        "apiActions": [
            {
                "action": "some_unauthorized_action",
                "name": "confirm",
                "endPoints": [
                    {
                        "url": "https://digdir.no",
                        "httpMethod": "GET"
                    },
                    {
                        "url": "https://digdir.no/deprecated",
                        "httpMethod": "GET",
                        "deprecated": true
                    }
                ]
            }
        ],
        "attachments": [
            {
                "displayName": [
                    {
                        "languageCode": "nb",
                        "value": "Et vedlegg"
                    }
                ],
                "urls": [
                    {
                        "consumerType": "gui",
                        "url": "https://foo.com/foo.pdf",
                        "mediaType": "application/pdf"
                    }
                ]
            },
            {
                "displayName": [
                    {
                        "languageCode": "nb",
                        "value": "Et annet vedlegg"
                    }
                ],
                "urls": [
                    {
                        "consumerType": "gui",
                        "url": "https://foo.com/foo.pdf",
                        "mediaType": "application/pdf"
                    }
                ]
            },
            {
                "displayName": [
                    {
                        "languageCode": "nb",
                        "value": "Nok et vedlegg"
                    }
                ],
                "urls": [
                    {
                        "consumerType": "gui",
                        "url": "https://foo.com/foo.pdf",
                        "mediaType": "application/pdf"
                    }
                ]
            }
        ],
        "activities": [
            {
                "type": "DialogCreated",
                "performedBy": {
                    "actorType": "partyRepresentative",
                    "actorName": "Some custom name"
                }
            },
            {
                "type": "PaymentMade",
                "performedBy": {
                    "actorType": "serviceOwner"
                }
            },
            {
                "type": "Information",
                "performedBy": {
                    "actorType": "partyRepresentative",
                    "actorId": "urn:altinn:organization:identifier-no:" + serviceOwner
                },
                "description": [
                    {
                        "value": "Brukeren har begått skattesvindel",
                        "languageCode": "nb"
                    },
                    {
                        "value": "Tax fraud",
                        "languageCode": "en"
                    }
                ]
            }
        ]
    };
};

/**
 * Get a dialog body without transmissions and activities, used for testing creation of dialogs without these.
 * @param {string} endUser - either a pid/ssn (11 digits) or an org number (9 digits)
 * @param {string} serviceResource - the service resource
 * @returns json object to be used as body when creating a dialog via the API, without transmissions and activities.
 */
export function getDialogBodyWithoutTransmissionsAndActivities(partyId, serviceResource) {
    let body = getDialogBody(partyId, serviceResource);
    body.transmissions = [];
    body.activities = [];
    return body;
}

/**
 * Get a transmission body, used for testing creation of transmissions. By default, the transmission will not be related to any other transmission, but you can provide an id of a transmission to relate it to.
 * @param {uuidv7} relatedTransmissionId - the id of a transmission to relate this transmission to. If 0 or not provided, the transmission will not be related to any other transmission.
 * @returns json object to be used as body when creating a transmission via the API.
 */
export function getTransmissionBody(relatedTransmissionId = 0) {
    let transmission =
    {
        "id": uuidv7(),
        "createdAt": new Date().toISOString(),
        "authorizationAttribute": "element1",
        "extendedType": "string",
        "type": "Information",
        "sender": {
            "actorType": "serviceOwner"
        },
        "content": {
            "title": {
                "value": [
                    {
                        "value": "Forsendelsestittel",
                        "languageCode": "nb"
                    },
                    {
                        "languageCode": "en",
                        "value": "Transmission title"
                    }
                ],
            },
            "summary": {
                "value": [
                    {
                        "languageCode": "nb",
                        "value": "Forsendelse oppsummering"
                    },
                    {
                        "languageCode": "en",
                        "value": "Transmission summary"
                    }
                ],
            },
        },
        "attachments": [
            {
                "displayName": [
                    {
                        "languageCode": "nb",
                        "value": "Forsendelse visningsnavn"
                    },
                    {
                        "languageCode": "en",
                        "value": "Transmission attachment display name"
                    }
                ],
                "urls": [
                    {
                        "url": "https://digdir.apps.tt02.altinn.no/some-other-url",
                        "consumerType": "Gui"
                    }
                ]
            }
        ]
    };
    if (relatedTransmissionId != 0) {
        transmission.relatedTransmissionId = relatedTransmissionId;
    }
    return transmission;
}

/**
 * Get a activity body, used for testing creation of activities. By default, the activity will be of type DialogCreated and performed by an actor of type ServiceOwner, but you can modify the returned object as needed.
 * @returns json object to be used as body when creating an activity via the API. The activity will have a random id, and the performedBy actor will be of type ServiceOwner with no id or name.
 */
export function getActivityBody() {
    return {
        "id": uuidv7(),
        "transmissionId": null,
        "extendedType": "string",
        "performedBy": {
            "actorType": "ServiceOwner",
            "actorId": null,
            "actorName": null
        },
        "description": [],
        "type": "DialogCreated",
        "createdAt": new Date().toISOString(),
    };
}
