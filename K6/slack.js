import http from "k6/http";

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


function buildPayload(data, report) {
    var payload = createDefaultPayload();
    let sectionBlocks = payload.attachments.find(
        (attachments) => attachments.blocks[1].type === "section",
    );

    sectionBlocks.blocks[0].text.text = sectionBlocks.blocks[0].text.text + ` for <https://github.com/Altinn/altinn-platform-validation-tests/blob/main/${__ENV.TESTFILENAME}|${__ENV.TESTFILENAME}> \n`;
    sectionBlocks.blocks[0].text.text = sectionBlocks.blocks[0].text.text + `Environment: ${__ENV.ENVIRONMENT} \n`;
    sectionBlocks.blocks[1].text.text = report;

    const grafanaBaseUrl = "https://grafana.altinn.cloud/d/cf5uw0ahcsj5sf/k6-logs-test-playground?orgId=1";
    let urlToLogs = grafanaBaseUrl + `&from=${__ENV.MANIFEST_GENERATION_TIMESTAMP}`;
    urlToLogs = urlToLogs + `&to=${new Date().getTime() + 5 * 60 * 1000}`; // 5 minutes
    urlToLogs = urlToLogs + `&var-namespace=${__ENV.NAMESPACE}`;
    urlToLogs = urlToLogs + `&var-test_name=${__ENV.TEST_NAME}`;
    urlToLogs = urlToLogs + `&var-testid=${__ENV.TESTID}`;
    urlToLogs = urlToLogs + `&&var-test_scope=${__ENV.TEST_SCOPE}`;

    sectionBlocks.blocks[3].elements[0].url = urlToLogs;

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

export default function postSlackMessage(data, report = null) {
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

    payload = buildPayload(data, report);

    const body = JSON.stringify(payload);

    try {
        const slackRes = http.post(__ENV.SLACK_WEBHOOK_URL, body, headers);
        if (slackRes.status != 200) {
            console.error("Could not send summary, got status " + slackRes.status);
            console.log(slackRes.body);
            console.log(body.results);
        }
    } catch (error) {
        console.error("Error sending Slack message:", error);
    }
}
