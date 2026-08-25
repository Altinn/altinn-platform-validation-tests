import { check } from "k6";
import http from "k6/http";

export default function () {
    const urls = [
        "https://playwright-artifacts-function-app-at22.azurewebsites.net/api/getreport/0000ecd9bcc152401e6892e036ec2d6cf0d0260b.png",
        "https://playwright-artifacts-function-app-at23.azurewebsites.net/api/getreport/0000ecd9bcc152401e6892e036ec2d6cf0d0260b.png",
        "https://playwright-artifacts-function-app-tt02.azurewebsites.net/api/getreport/0000ecd9bcc152401e6892e036ec2d6cf0d0260b.png",
        "https://playwright-artifacts-function-app.azurewebsites.net/api/getreport/0000ecd9bcc152401e6892e036ec2d6cf0d0260b.png"
    ];
    for (const url of urls) {

        const res = http.get(url, {
            timeout: "10s",
        });

        check(res, { "unauthenticated request returns 401": (r) => r.status == 401 });

    }

    // Azure should restrict the API by default, but it does not hurt to add a simple sanity check.
    // https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/static_web_app_function_app_registration
}
