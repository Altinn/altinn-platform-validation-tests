import http from "k6/http";

import { isBlacklisted } from "./slack-blacklist.js";

export function createDefaultPayload() {
    return {
        attachments: [
            {
                color: "#632eb8",
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: "*|K6 Report Summary*",
                        },
                    },
                    {
                        type: "section",
                        text: {
                            type: "plain_text",
                            text: "",
                        },
                    },
                    {
                        type: "divider",
                    },
                    {
                        type: "actions",
                        elements: [
                            {
                                type: "button",
                                text: {
                                    type: "plain_text",
                                    text: "Logs :grafana:",
                                    emoji: true,
                                },
                                value: "click_me_123",
                                url: "",
                            },
                        ],
                    },
                ],
            },
        ],
    };
}

/**
 * @param {unknown} data The k6 summary data. Passed through from the caller;
 * the message body comes from report rather than from this.
 * @param {string} report The rendered report to put in the message body.
 * @returns {ReturnType<typeof createDefaultPayload>} The Slack payload to post.
 */
function buildPayload(data, report) {
    var payload = createDefaultPayload();
    let sectionBlocks = payload.attachments.find(
        (attachments) => attachments.blocks[1].type === "section",
    );

    if (!sectionBlocks) {
        // createDefaultPayload always builds this attachment, so this only trips
        // if that payload is changed without updating this function.
        throw new Error("Slack payload has no section attachment to fill in");
    }

    // The blocks the report fills in: the heading, the report body and the
    // actions row holding the link to the logs. The third block is the divider.
    const [headingBlock, reportBlock, , actionsBlock] = sectionBlocks.blocks;

    if (!headingBlock?.text || !reportBlock?.text || !actionsBlock?.elements) {
        throw new Error("Slack payload does not have the blocks the report fills in");
    }

    headingBlock.text.text = headingBlock.text.text + ` for <https://github.com/Altinn/altinn-platform-validation-tests/blob/main/${__ENV.TESTFILENAME}|${__ENV.TESTFILENAME}> \n`;
    headingBlock.text.text = headingBlock.text.text + `Environment: ${__ENV.ENVIRONMENT} \n`;
    reportBlock.text.text = report;

    const grafanaBaseUrl = "https://grafana.altinn.cloud/d/cf5uw0ahcsj5sf/k6-logs-test-playground?orgId=1";
    let urlToLogs = grafanaBaseUrl + `&from=${__ENV.MANIFEST_GENERATION_TIMESTAMP}`;
    urlToLogs = urlToLogs + `&to=${new Date().getTime() + 5 * 60 * 1000}`; // 5 minutes
    urlToLogs = urlToLogs + `&var-namespace=${__ENV.NAMESPACE}`;
    urlToLogs = urlToLogs + `&var-test_name=${__ENV.TEST_NAME}`;
    urlToLogs = urlToLogs + `&var-testid=${__ENV.TESTID}`;
    urlToLogs = urlToLogs + `&&var-test_scope=${__ENV.TEST_SCOPE}`;

    actionsBlock.elements[0].url = urlToLogs;

    return payload;
}

function buildHeaders() {
    return {
        headers: {
            Authorization: "Bearer " + __ENV.SLACK_TOKEN,
            "Content-type": "application/json",
        },
    };
}

/**
 * Posts the report to the Slack webhook, unless the run is blacklisted.
 *
 * @param {unknown} data The k6 summary data.
 * @param {string|null} [report] The rendered report to post.
 * @returns {void} Nothing. Failures are logged rather than thrown.
 */
export default function postSlackMessage(data, report = null) {
    if (isBlacklisted()) {
        return;
    }
    if (!__ENV.SLACK_WEBHOOK_URL) {
        console.error("SLACK_WEBHOOK_URL environment variable is not defined");
        return;
    }
    if (!__ENV.SLACK_TOKEN) {
        console.error("SLACK_TOKEN environment variable is not defined");
        return;
    }
    const headers = buildHeaders();
    let payload;

    payload = buildPayload(data, report ?? "");

    const body = JSON.stringify(payload);

    try {
        const slackRes = http.post(__ENV.SLACK_WEBHOOK_URL, body, headers);
        if (slackRes.status != 200) {
            console.error("Could not send summary, got status " + slackRes.status);
            console.log(slackRes.body);
            console.log(body);
        }
    } catch (error) {
        console.error("Error sending Slack message:", error);
    }
}
