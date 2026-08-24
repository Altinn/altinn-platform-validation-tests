import { check } from "k6";
import http from "k6/http";

import { getOptions, requireEnv } from "../../../helpers.js";
import { withRetries } from "../../building-blocks/common/retry.js";

const healthLabel = { step: "infoportal health" };

export const options = getOptions([healthLabel]);

export default function () {
    requireEnv(["INFO_CLOUD_URL"]);

    const url = `${__ENV.INFO_CLOUD_URL}/health`;
    const res = withRetries(
        () => http.get(url, { tags: healthLabel }),
        "infoportal-health",
    );

    const statusOk = check(res, {
        "infoportal health status is 200": (r) => r.status === 200,
    });

    if (!statusOk) {
        console.log(
            `Infoportal health check failed: ${res.status} ${res.body}`,
        );
        return;
    }

    let body;

    try {
        body = res.json();
        check(null, {
            "infoportal health response is valid JSON": () => true,
        });
    } catch (error) {
        console.log(`Infoportal health response is not valid JSON: ${error}`);
        check(null, {
            "infoportal health response is valid JSON": () => false,
        });
        return;
    }

    const overallOk = check(body, {
        "infoportal overall status is healthy": (b) =>
            b?.status === "Healthy",
        "infoportal health entries are present": (b) =>
            b?.entries &&
            typeof b.entries === "object" &&
            !Array.isArray(b.entries),
    });

    if (!body?.entries) {
        console.log(body);
        return;
    }

    for (const [name, healthCheck] of Object.entries(body.entries)) {
        check(healthCheck, {
            [`${name} status is healthy`]: (hc) =>
                hc?.status === "Healthy",
        });
    }
}
