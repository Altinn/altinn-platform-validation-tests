import http from "k6/http";
import { check } from "k6";

export function getInfoCloud(path, label) {
    const endpoint = `${__ENV.INFO_CLOUD_URL}${path}`;
    const params = {
        tags: label,
    };
    const res = http.get(endpoint, params);

    const succeed = check(res, {
        "status code is 200": (r) => r.status === 200,
        "status text is 200 OK": (r) => r.status_text == "200 OK",
    });
    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }
}


