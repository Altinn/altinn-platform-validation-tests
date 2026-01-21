import { check } from "k6";

/**
 * Function to check common response properties for pagination endpoints
 * @param {} res - response object
 */
export function CheckAndVerifyResponse(res) {
    const basicSucceed = check(res, {
        "status code is 200": (r) => r.status === 200,
        "status text is 200 OK": (r) => r.status_text == "200 OK",
        "body is not empty": (r) =>
            r.body !== null && r.body !== undefined && r.body !== "",
    });

    if (!basicSucceed) {
        console.log(res.status);
        console.log(res.status_text);
        console.log(res.body);
    };
    if (!basicSucceed) return false;

    const responseBody = JSON.parse(res.body);

    const jsonSucceed = check(responseBody, {
        "body is valid JSON": (b) => b !== null && b !== undefined,
        "body has data array": (b) => b && Array.isArray(b.data),
        "body has links": (b) => b && b.links !== undefined,
    });

    if (!jsonSucceed) {
        console.log(res.body);
    };

    return basicSucceed && jsonSucceed;
}