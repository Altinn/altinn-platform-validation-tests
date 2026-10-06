// Typene følger Storage-swaggeren, https://docs.altinn.studio/nb/api/storage/spec/.
// Instance og alle modellene den refererer til er tatt med, med alle properties.

export type CompleteConfirmation = {
    stakeholderId?: string | null;
    confirmedOn: string;
};

export type DataElement = {
    id?: string | null;
    instanceGuid?: string | null;
    dataType?: string | null;
    filename?: string | null;
    contentType?: string | null;
    blobStoragePath?: string | null;
    blobVersionId?: string | null;
    selfLinks: ResourceLinks;
    size: number;
    contentHash?: string | null;
    locked: boolean;
    refs?: string[] | null;
    isRead: boolean;
    tags?: string[] | null;
    userDefinedMetadata?: KeyValueEntry[] | null;
    metadata?: KeyValueEntry[] | null;
    deleteStatus: DeleteStatus;
    fileScanResult: FileScanResult;
    references?: Reference[] | null;
    created?: string | null;
    createdBy?: string | null;
    lastChanged?: string | null;
    lastChangedBy?: string | null;
};

export type DeleteStatus = {
    isHardDeleted: boolean;
    hardDeleted?: string | null;
};

export type FileScanResult = "NotApplicable" | "Pending" | "Clean" | "Infected";

export type Instance = {
    id?: string | null;
    instanceOwner: InstanceOwner;
    appId?: string | null;
    org?: string | null;
    selfLinks: ResourceLinks;
    dueBefore?: string | null;
    visibleAfter?: string | null;
    process: ProcessState;
    status: InstanceStatus;
    completeConfirmations?: CompleteConfirmation[] | null;
    data?: DataElement[] | null;
    presentationTexts?: Record<string, string> | null;
    dataValues?: Record<string, string> | null;
    created?: string | null;
    createdBy?: string | null;
    lastChanged?: string | null;
    lastChangedBy?: string | null;
};

export type InstanceOwner = {
    partyId?: string | null;
    personNumber?: string | null;
    organisationNumber?: string | null;
    username?: string | null;
    externalIdentifier?: string | null;
};

export type InstanceStatus = {
    isArchived: boolean;
    archived?: string | null;
    isSoftDeleted: boolean;
    softDeleted?: string | null;
    isHardDeleted: boolean;
    hardDeleted?: string | null;
    readStatus: ReadStatus;
    substatus: Substatus;
};

export type KeyValueEntry = {
    key?: string | null;
    value?: string | null;
};

export type ProcessElementInfo = {
    flow?: number | null;
    started?: string | null;
    elementId?: string | null;
    name?: string | null;
    altinnTaskType?: string | null;
    ended?: string | null;
    validated: ValidationStatus;
    flowType?: string | null;
};

export type ProcessState = {
    started?: string | null;
    startEvent?: string | null;
    currentTask: ProcessElementInfo;
    ended?: string | null;
    endEvent?: string | null;
    status: ProcessStatus;
};

export type ProcessStatus = "idle" | "processing";

export type ReadStatus = "Unread" | "Read" | "UpdatedSinceLastReview";

export type Reference = {
    value?: string | null;
    relation: RelationType;
    valueType: ReferenceType;
};

export type ReferenceType = "DataElement" | "Task";

export type RelationType = "GeneratedFrom";

export type ResourceLinks = {
    apps?: string | null;
    platform?: string | null;
};

export type Substatus = {
    label?: string | null;
    description?: string | null;
};

export type ValidationStatus = {
    timestamp?: string | null;
    canCompleteTask: boolean;
};

// Headerne for optimistisk samtidighetskontroll som skrive-operasjonene tar imot. Begge er valgfrie.
export type VersionMatch = {
    ifInstanceVersionMatch?: string | null;
    ifProcessStateVersionMatch?: string | null;
};
