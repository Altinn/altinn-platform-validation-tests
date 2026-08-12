
import ForEmailAdddress from "./for-email-addr.js";
import { setup as SetupForEmailAdddress } from "./for-email-addr.js";
import ForMobileNumber from "./for-mobile-number.js";
import { setup as SetupForMobileNumber } from "./for-mobile-number.js";
import ForOrg from "./for-orgs.js";
import { setup as SetupForOrg } from "./for-orgs.js";
import ForPersons from "./for-persons.js";
import { setup as SetupForPersons } from "./for-persons.js";

export function setup() {
    return {
        "ForEmailAdddress": SetupForEmailAdddress(),
        "ForMobileNumber": SetupForMobileNumber(),
        "ForOrg": SetupForOrg(),
        "ForPersons": SetupForPersons()
    };
}

export default function (data) {
    ForEmailAdddress();
    ForMobileNumber();
    ForOrg();
    ForPersons();
}
