/**
 * GraphQL queries for Dialogporten
 * TODO: These can be moved to separate files if the number of queries grows too large
 */

/**
 * Get dialog by id
 * @param {uuidv7} id
 * @returns graphql query to get dialog by id
 */
export function getDialogById(id) {
    const q = {
        query: `query getDialogById($id: UUID!) {
            dialogById(dialogId: $id) {
              dialog {
                ...DialogByIdFields
              }
              errors {
                __typename
                message
              }
            }
          }

          fragment DialogByIdFields on Dialog {
            id
            dialogToken
            party
            org
            progress
            serviceResourceType
            fromServiceOwnerTransmissionsCount
            fromPartyTransmissionsCount
            attachments {
              ...AttachmentFields
            }
            activities {
              ...DialogActivity
            }
            guiActions {
              ...GuiActionFields
            }
            seenSinceLastContentUpdate {
              ...SeenLogFields
            }
            transmissions {
              ...TransmissionFields
            }
            status
            dueAt
            createdAt
            contentUpdatedAt
            hasUnopenedContent
            endUserContext {
              systemLabels
            }
            content {
              title {
                ...DialogContentFields
              }
              summary {
                ...DialogContentFields
              }
              senderName {
                ...DialogContentFields
              }
              additionalInfo {
                ...DialogContentFields
              }
              extendedStatus {
                ...DialogContentFields
              }
              mainContentReference {
                ...DialogContentFields
              }
            }
          }

          fragment AttachmentFields on Attachment {
            id
            displayName {
              value
              languageCode
            }
            expiresAt
            urls {
              ...AttachmentUrlFields
            }
          }

          fragment AttachmentUrlFields on AttachmentUrl {
            id
            url
            consumerType
            mediaType
          }

          fragment DialogActivity on Activity {
            id
            transmissionId
            performedBy {
              actorType
              actorId
              actorName
            }
            description {
              value
              languageCode
            }
            type
            createdAt
          }

          fragment GuiActionFields on GuiAction {
            id
            url
            isAuthorized
            isDeleteDialogAction
            action
            authorizationAttribute
            priority
            httpMethod
            title {
              languageCode
              value
            }
            prompt {
              value
              languageCode
            }
          }

          fragment SeenLogFields on SeenLog {
            id
            seenAt
            seenBy {
              actorType
              actorId
              actorName
            }
            isCurrentEndUser
          }

          fragment TransmissionFields on Transmission {
            id
            isAuthorized
            createdAt
            type
            sender {
              actorType
              actorId
              actorName
            }
            relatedTransmissionId
            content {
              title {
                value {
                  value
                  languageCode
                }
                mediaType
              }
              summary {
                value {
                  value
                  languageCode
                }
                mediaType
              }
              contentReference {
                value {
                  value
                  languageCode
                }
                mediaType
              }
            }
            attachments {
              id
              displayName {
                value
                languageCode
              }
              urls {
                id
                url
                consumerType
                mediaType
              }
            }
          }

          fragment DialogContentFields on ContentValue {
            mediaType
            value {
              value
              languageCode
            }
          }`,
        operationName: "getDialogById",
        variables: {
            id: id,
        }
    };
    return q;
}

/**
 * Get all dialogs for party
 * @param {string} partyId - either a pid/ssn (11 digits) or an org number (9 digits)
 * returns graphql query to get all dialogs for party
 */
export function getAllDialogsForParty(partyId) {
    // The API expects a party URI in the format urn:altinn:person:identifier-no:{pid} for individuals and urn:altinn:organization:identifier-no:{orgnr} for organizations
    // We can determine the type of party based on the length of the id, as pids are 11 digits and org numbers are 9 digits
    // TODO: This is a bit brittle, as it relies on the format of the ids, but it is a simple way to determine the party type without making an additional API call
    let partyUri = `urn:altinn:person:identifier-no:${partyId}`;
    if (partyId.length == 9) {
        partyUri = `urn:altinn:organization:identifier-no:${partyId}`;
    }
    const q = {
        query: `query getAllDialogsForParties($partyURIs: [String!], $search: String, $org: [String!], $status: [DialogStatus!], $continuationToken: String, $limit: Int, $label: [SystemLabel!], $updatedAfter: DateTime, $updatedBefore: DateTime, $searchLanguageCode: String, $serviceResources: [String!]) {
            searchDialogs(
              input: {party: $partyURIs, search: $search, org: $org, status: $status, continuationToken: $continuationToken, orderBy: {createdAt: null, updatedAt: null, dueAt: null, contentUpdatedAt: DESC}, systemLabel: $label, contentUpdatedAfter: $updatedAfter, contentUpdatedBefore: $updatedBefore, limit: $limit, excludeApiOnly: true, searchLanguageCode: $searchLanguageCode, serviceResource: $serviceResources}
            ) {
              items {
                ...SearchDialogFields
              }
              hasNextPage
              continuationToken
            }
          }

          fragment SearchDialogFields on SearchDialog {
            id
            party
            org
            progress
            guiAttachmentCount
            status
            createdAt
            dueAt
            contentUpdatedAt
            hasUnopenedContent
            serviceResourceType
            serviceResource
            seenSinceLastContentUpdate {
              ...SeenLogFields
            }
            fromServiceOwnerTransmissionsCount
            fromPartyTransmissionsCount
            content {
              title {
                ...DialogContentFields
              }
              summary {
                ...DialogContentFields
              }
              senderName {
                ...DialogContentFields
              }
              extendedStatus {
                ...DialogContentFields
              }
            }
            endUserContext {
              systemLabels
            }
          }

          fragment SeenLogFields on SeenLog {
            id
            seenAt
            seenBy {
              actorType
              actorId
              actorName
            }
            isCurrentEndUser
          }

          fragment DialogContentFields on ContentValue {
            mediaType
            value {
              value
              languageCode
            }
          }`,
        operationName: "getAllDialogsForParties",
        variables: {
            partyURIs: [partyUri],
            status: ["NOT_APPLICABLE", "IN_PROGRESS", "AWAITING", "REQUIRES_ATTENTION", "COMPLETED"],
            serviceResources: [],
            label: ["DEFAULT"],
            limit: 100,
            searchLanguageCode: "nb",
        }
    };
    return q;
}
