import { check } from "k6";
import http from "k6/http";

import { getOptions, requireEnv } from "../../../helpers.js";
import { withRetries } from "../../building-blocks/common/retry.js";

const healthLabel = { step: "arbeidsflate health" };

export const options = getOptions([healthLabel]);

export default function () {
    requireEnv(["AM_UI_BASE_URL"]);
    const url = `${__ENV.AM_UI_BASE_URL}/health`;
    const res = withRetries(
        () => http.get(url, { tags: healthLabel }),
        "arbeidsflate-health",
    );

    const succeed = check(res, {
        "arbeidsflate health status is 200": (r) => r.status === 200,
    });

    if (!succeed) {
        console.log(`Arbeidsflate health check failed: ${res.status} ${res.body}`);
    }
}
