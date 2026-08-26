import { setup as CommonSetup } from "./common.js";
import DaglAFaarPersonAIAktoerlista from "./dagl-a-faar-person-a-i-aktoerlista.js";
import DaglAVUnderenhetFaarHovedenhetAIiAktoerlista from "./dagl-av-underenhet-faar-hovedenhet-a-i-aktoerlista.js";
import DaglBFaarHovedenhetAIAktoerlista from "./dagl-b-faar-hovedenhet-a-i-aktoerlista.js";
import DaglBFaarUnderenhetCIiAktoerlista from "./dagl-b-faar-underenhet-c-i-aktoerlista.js";
import DaglCFaarUnderenhetDIiAktoerlista from "./dagl-c-faar-underenhet-d-i-aktoerlista.js";
import PersonAFaarUnderenhetDIiAktoerlista from "./person-a-faar-underenhet-d-i-aktoerlista.js";
import PersonBFaarPersonAIiAktoerlista from "./person-b-faar-person-a-i-aktoerlista.js";
import PersonCFaarHovedenhetAIiAktoerlista from "./person-c-faar-hovedenhet-a-i-aktoerlista.js";

export function setup() {
    return CommonSetup();
};

/**
 * @param {ReturnType<typeof setup>} data Test data from setup.
 */
export default function (data) {
    DaglAFaarPersonAIAktoerlista(data);
    DaglBFaarHovedenhetAIAktoerlista(data);
    DaglCFaarUnderenhetDIiAktoerlista(data);
    PersonAFaarUnderenhetDIiAktoerlista(data);
    PersonCFaarHovedenhetAIiAktoerlista(data);
    DaglAVUnderenhetFaarHovedenhetAIiAktoerlista(data);
    DaglBFaarUnderenhetCIiAktoerlista(data);
    PersonBFaarPersonAIiAktoerlista(data);
}
