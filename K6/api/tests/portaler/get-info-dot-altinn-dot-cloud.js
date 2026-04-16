import http from "k6/http";
import { check } from "k6";

export default function () {
    const tags = { "endpoint": __ENV.INFO_CLOUD_URL };
    const params = {
        tags: tags,
    };
    const res = http.get(__ENV.INFO_CLOUD_URL, params);

    const succeed = check(res, {
        "status code is 200": (r) => r.status === 200,
        "status text is 200 OK": (r) => r.status_text == "200 OK",
    });
    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }
}
