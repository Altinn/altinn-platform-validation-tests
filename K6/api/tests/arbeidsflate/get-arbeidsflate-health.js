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

    const succeed = check(res, {
        "status code is 200": (r) => r.status === 200,
    });

    if (!succeed) {
        console.log(`Arbeidsflate health check failed: ${res.status} ${res.body}`);
        return;
    }

    const body = res.json();

    check(body, {
        "overall status is ok": (b) => b.status === "ok",
    });

    for (const [name, healthCheck] of Object.entries(body.healthChecks)) {
        check(healthCheck, {
            [`${name} status is ok`]: (hc) => hc.status === "ok",
        });
    }
}
