export { setup } from "./common.js";
import { EndUserAuthorizedPartiesQueryBuilder } from "../../../../clients/access-management/enduser/authorized-parties/authorized-parties-query-builder.js";
import { GetAuthorizedParties } from "../../../building-blocks/access-management/enduser/authorized-parties/get-authorized-parties.js";
import { getClients } from "./common.js";

export default function (data) {
    const dagligleder = data.testdata.authParties_hovedenhetB.dagligleder;
    let [authorizedPartiesClient] = getClients(dagligleder.userid, dagligleder.partyid, dagligleder.partyuuid, dagligleder.pid);

    const queryParams = new EndUserAuthorizedPartiesQueryBuilder()
        .includePartiesViaKeyRoles(true)
        .build();

    const authorizedParties = GetAuthorizedParties(authorizedPartiesClient, queryParams);

    // TODO: Checks
    // https://github.com/Altinn/altinn-authorization-tmp/blob/main/src/apps/Altinn.AccessManagement/test/Bruno/AccessMgmt/test/auth_parties_Hovedenhet_Underenhet/AsEndUser_authParties/GET_EUS_H2H_DagliglederB_SeesHovedenhetA.bru#L48-L97

}
