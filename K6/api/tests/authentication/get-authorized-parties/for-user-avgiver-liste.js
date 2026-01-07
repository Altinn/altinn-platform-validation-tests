
import { GetAuthorizedParties } from "../../../building-blocks/authentication/authorized-parties/index.js";
import { getClients } from "./common-functions.js";
import { getItemFromList, getOptions } from "../../../../helpers.js";
export { setup } from "./common-functions.js";

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

const label = "getAuthorizedPartiesForUserAvgiverListe";

export const options = getOptions([label]);

export default function (data) {
    const [authorizedPartiesClient] = getClients();
    const userParty = getItemFromList(data, randomize);
    const queryParams = {
        includeAltinn2: true,
        includeAltinn3: true,
        includeRoles: false,
        includeAccessPackages: false,
        includeResources: false,
        includeInstances: false
    };

    GetAuthorizedParties(
        authorizedPartiesClient,
        "urn:altinn:person:identifier-no",
        userParty.ssn,
        queryParams,
        label
    );
}

// Header Avgiverliste/Aktørvelger:
// includeAltinn2=true
// includeAltinn3=true
// includeRoles=false
// includeAccessPackages=false
// includeResources=false
// includeInstances=false
// uten partyFilter i body/query
// Eksempel: https://platform.yt01.altinn.cloud/accessmanagement/api/v1/resourceowner/authorizedparties?includeAltinn2=true&includeAltinn3=true&includeRoles=false&includeAccessPackages=false&includeResources=false&includeInstances=false
// Dialogporten autorisasjon:
// includeAltinn2=true
// includeAltinn3=true
// includeRoles=true
// includeAccessPackages=true
// includeResources=true
// includeInstances=true
// Med partyFilter i body/query
// Her vil det vel være inntil 25 (?) parties basert på valg av filter i dialogporten
