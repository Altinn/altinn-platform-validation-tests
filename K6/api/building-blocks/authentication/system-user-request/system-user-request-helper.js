import { check } from "k6";

/**
 * Function to check common response properties for pagination endpoints
 * @param {} res - response object
 */
export function CheckAndVerifyResponse(res) {
    const isOk = check(res, {
        "status is 200": (r) => r.status === 200,
        "status text is 200 OK": (r) => r.status_text === "200 OK",
    });

    if (!isOk) {
        console.log(res.status, res.status_text);
        console.log(res.body);
    }
}
