import { getOptions } from "../../../helpers.js";
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

    const succeed = check(res, {
        "infoportal health status is 200": (r) => r.status === 200,
    });

    if (!succeed) {
        console.log(`Infoportal health check failed: ${res.status} ${res.body}`);
    }
}
