// import building blocks
import {InitializeCorrespondencesBuilder} from "../../../clients/correspondence/correspondence.builder.js";
import { BaseCorrespondenceExt} from "../../../clients/correspondence/correspondence.types.js";
import { requireEnv } from "../../../helpers.js";
import { InitializeCorrespondences } from "../../building-blocks/correspondence/correspondence/index.js";
import { getClients } from "./commons.js";

/**
 * @returns {object[]} The system user to change, as a single item list.
 */
export function setup() {
    // Two packages, so the change request can give one up and ask for the other.
    requireEnv(["ENVIRONMENT", "BASE_URL"]);
}

/**
 * Test: initialize a correspondence
 *
 * @param {object[]} data The arranged system users from setup.
 */
export default function (data) {
    
    const [correspondenceClient] = getClients();

    const resource_id = "bruno-correspondence";
    const sender = "0192:313154599";    

    /** @type {BaseCorrespondenceExt|null} */
    const correspondence = {
        resourceId: resource_id,
        sender: sender,
        sendersReference: "1",
        content: {
            language: "nb",
            messageTitle: "Meldingstittel",
            messageSummary: "Ett sammendrag for meldingen",
            messageBody: "# meldingsteksten. Som kan være plain text eller markdown ",
            attachments: [],
        },
        visibleFrom: "2024-09-28T12:44:28.290518+00:00",
        dueDateTime: "2025-05-29T13:31:28.290518+00:00",
        externalReferences: [],
        propertyList: {},
        replyOptions: [
            {
                linkURL: "www.test.no",
                linkText: "test",
            },
            {
                linkURL: "test.no",
                linkText: "test",
            },
        ],
        notification: {
            notificationTemplate: 0,
            notificationChannel: 3,
            SendReminder: true,
            EmailBody: "Test av varsel",
            EmailSubject: "Dette er innholdet i ett varsel",
            SmsBody: "Dette er innholdet i ett testvarsel",
            ReminderEmailBody: "Dette er test av revarsling ",
            ReminderEmailSubject: "Test av revarsel",
            ReminderSmsBody: "Dette er en test av revarslingl",
        },
        isReservable: true,
    };

    const requestBody = new InitializeCorrespondencesBuilder()
        .withRecipients(["0192:123456789"])
        .withCorrespondence(correspondence)
        .build();

    const initializeResponse = InitializeCorrespondences(
        correspondenceClient,
        requestBody,
    );

}
