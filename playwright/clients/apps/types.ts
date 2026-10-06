// Typene følger app-swaggeren, https://docs.altinn.studio/nb/api/apps/spec/, hentet fra
// /{org}/{app}/swagger/v1/swagger.json. Instance og alle modellene den refererer til er
// tatt med, med alle properties. Den skiller seg fra Storage-modellen, se ../storage/types.ts.

export type CompleteConfirmation = {
    stakeholderId?: string | null;
    confirmedOn: string;
};

export type DataElement = {
    created?: string | null;
    createdBy?: string | null;
    lastChanged?: string | null;
    lastChangedBy?: string | null;
    id?: string | null;
    instanceGuid?: string | null;
    dataType?: string | null;
    filename?: string | null;
    contentType?: string | null;
    blobStoragePath?: string | null;
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
};

export type DeleteStatus = {
    isHardDeleted: boolean;
    hardDeleted?: string | null;
};

export type FileScanResult = "NotApplicable" | "Pending" | "Clean" | "Infected";

export type Instance = {
    created?: string | null;
    createdBy?: string | null;
    lastChanged?: string | null;
    lastChangedBy?: string | null;
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
    presentationTexts?: Record<string, string | null> | null;
    dataValues?: Record<string, string | null> | null;
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
};

// Appen serialiserer enumen som tall: 0 = Unread, 1 = Read, 2 = UpdatedSinceLastReview.
export type ReadStatus = 0 | 1 | 2;

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
