import { check } from "k6";
import http from "k6/http";

import { getOptions, requireEnv } from "../../../helpers.js";
import { withRetries } from "../../building-blocks/common/retry.js";

const healthLabel = { step: "arbeidsflate health" };

export const options = getOptions([healthLabel]);

export default function () {
    requireEnv(["AF_UI_BASE_URL"]);

    const url = `${__ENV.AF_UI_BASE_URL}/api/health`;
    const res = withRetries(
        () => http.get(url, { tags: healthLabel }),
        "arbeidsflate-health",
    );

    const statusOk = check(res, {
        "status code is 200": (r) => r.status === 200,
    });

    if (!statusOk) {
        console.log(
            `Arbeidsflate health check failed: ${res.status} ${res.body}`,
        );
        return;
    }

    /**
     * The part of the health response this test reads.
     *
     * @typedef {object} ArbeidsflateHealth
     * @property {string} [status] Overall status of the service.
     * @property {{[name: string]: {status?: string}}} [healthChecks] One entry per dependency.
     */

    /** @type {ArbeidsflateHealth} */
    let body = {};

    try {
        body = /** @type {ArbeidsflateHealth} */ (res.json());
        check(null, {
            "response is valid JSON": () => true,
        });
    } catch (error) {
        console.log(`Arbeidsflate health response is not valid JSON: ${error}`);
        check(null, {
            "response is valid JSON": () => false,
        });
        return;
    }

    const overallOk = check(body, {
        "overall status is ok": (b) => b?.status === "ok",
        "health checks are present": (b) =>
            b?.healthChecks !== undefined &&
            typeof b.healthChecks === "object" &&
            !Array.isArray(b.healthChecks),
    });

    if (!overallOk || !body?.healthChecks) {
        return;
    }

    for (const [name, healthCheck] of Object.entries(body.healthChecks)) {
        check(healthCheck, {
            [`${name} status is ok`]: (hc) => hc?.status === "ok",
        });
    }
}
