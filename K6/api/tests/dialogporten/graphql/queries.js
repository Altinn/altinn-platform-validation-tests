const getAllDialogsForPartyQuery = {
    query: `query getAllDialogsForParties(
                   $partyURIs: [String!],
                   $serviceResource: [String!],
                   $search: String,
                   $org: [String!],
                   $status: [DialogStatus!],
                   $continuationToken: String,
                   $limit: Int,
                   $label: [SystemLabel!],
                   $createdAfter: DateTime,
                   $createdBefore: DateTime,
                   $updatedAfter: DateTime,
                   $updatedBefore: DateTime)
                   {
                       searchDialogs(
                          input: {
                            party: $partyURIs,
                            search: $search,
                            serviceResource: $serviceResource,
                            org: $org,
                            status: $status,
                            continuationToken: $continuationToken,
                            orderBy: {
                              createdAt: null,
                              updatedAt: null,
                              dueAt: null,
                              contentUpdatedAt: DESC
                            },
                            systemLabel: $label,
                            createdAfter: $createdAfter,
                            createdBefore: $createdBefore,
                            updatedAfter: $updatedAfter,
                            updatedBefore: $updatedBefore,
                            limit: $limit,
                            excludeApiOnly: true
                          }
                        ) {
                            items {
                                ...SearchDialogFields
                                }
                            hasNextPage
                            continuationToken
                            errors { message }
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
                      updatedAt
                      dueAt
                      contentUpdatedAt
                      hasUnopenedContent
                      extendedStatus
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
    variables: {},
};

const getDialogByIdQuery = {
    operationName: "getDialogById",
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
    variables: { id: "" },
};

export { getAllDialogsForPartyQuery, getDialogByIdQuery };
