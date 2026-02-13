/*
* STILL UNDER DEVELOPMENT
* Script to create dialogs in Dialogporten for various resources using K6 performance testing tool.
* Run: k6 run create-dialogs.js
* Set environment variables:
*   ENVIRONMENT - the target environment (e.g., "yt01", "at23", "tt02")
*   BASE_URL - the base URL of the Dialogporten Service Owner API
* Example:
*   ENVIRONMENT=yt01 BASE_URL=https://platform.yt01.altinn.cloud k6 run create-dialogs.js
* TOKEN_GENERATOR_USERNAME and TOKEN_GENERATOR_PASSWORD must also be set in the environment for token generation
*/
import http from "k6/http";
import { EnterpriseTokenGenerator } from "../../../../../common-imports.js";
import { CreateDialog } from "../../../dialogporten/serviceowner/index.js";
import { ServiceOwnerApiClient } from "../../../../../clients/dialogporten/serviceowner/index.js";

import { getItemFromList, getOptions, parseCsvData } from "../../../../../helpers.js";

const resources = [
    "k6-test-innbygger-stotte-tilskudd",
    "k6-test-innbygger-forsikring",
    "k6-test-innbygger-avlastning-stotte",
    "k6-test-innbygger-design-varemerke",
    "k6-test-innbygger-kultur",
    "k6-test-innbygger-pleie-omsorg",
    "k6-test-innbygger-toll-avgift",
    "k6-test-innbygger-bolig-eiendom",
    "k6-test-innbygger-byggesoknad",
    "k6-test-innbygger-pensjon",
    "k6-test-innbygger-sertifisering",
    "k6-test-innbygger-vapen",
    "k6-test-innbygger-arbeidsliv",
    "k6-test-innbygger-straffesak",
    "k6-test-innbygger-frivillighet",
    "k6-test-innbygger-tilgangsstyring-privatperson",
    "k6-test-innbygger-bank-finans",
    "k6-test-innbygger-utdanning",
    "k6-test-innbygger-soknader-sertifisering",
    "k6-test-innbygger-kjoretoy",
    "k6-test-innbygger-forerkort",
    "k6-test-innbygger-skatteforhold-privatpersoner",
    "k6-test-innbygger-samliv",
    "k6-test-innbygger-barn-foreldre",
    "k6-test-innbygger-permisjon-oppsigelse",
    "k6-test-innbygger-barnehage-sfo-skole",
    "k6-test-innbygger-fritidsaktiviteter-friluftsliv",
    "k6-test-innbygger-idrett",
    "k6-test-innbygger-behandling",
    "k6-test-innbygger-loyve",
    "k6-test-innbygger-patent",
    "k6-test-innbygger-sykefravaer",
    "k6-test-innbygger-attester",
    "k6-test-innbygger-helsetjenester",
    "k6-test-vergemal-tingretten-begjaere-uskifte",
    "k6-test-vergemal-inkassoselskap-inkassoavtaler",
    "k6-test-vergemal-ovrige-inngaelse-husleiekontrakter",
    "k6-test-vergemal-skatteetaten-melde-flytting",
    "k6-test-vergemal-nav-hjelpemidler",
    "k6-test-vergemal-skatteetaten-endre-postadresse",
    "k6-test-vergemal-skatteetaten-skatt",
    "k6-test-vergemal-kartverket-avtaler-rettigheter",
    "k6-test-vergemal-kartverket-sletting",
    "k6-test-vergemal-namsmannen-gjeldsordning",
    "k6-test-vergemal-kredittvurderingsselskap-kredittsperre",
    "k6-test-vergemal-husbanken-bostotte",
    "k6-test-vergemal-ovrige-salg-losore-storre-verdi",
    "k6-test-vergemal-kommune-bygg-eiendom",
    "k6-test-vergemal-namsmannen-tvangsfullbyrdelse",
    "k6-test-vergemal-helfo-refusjon-privatpersoner",
    "k6-test-vergemal-helfo-fastlege",
    "k6-test-vergemal-husbanken-startlan",
    "k6-test-vergemal-nav-pensjon",
    "k6-test-vergemal-ovrige-avslutning-husleiekontrakter",
    "k6-test-vergemal-kommune-skole-utdanning",
    "k6-test-vergemal-kartverket-arv-privat-skifte-uskifte",
    "k6-test-vergemal-kommune-sosiale-tjenester",
    "k6-test-vergemal-tingretten-privat-skifte-dodsbo",
    "k6-test-vergemal-skatteetaten-innkreving",
    "k6-test-vergemal-kommune-helse-omsorg",
    "k6-test-vergemal-forsikringsselskap-forvalte-forsikringsavtaler",
    "k6-test-vergemal-bank-ta-opp-lan-kreditter",
    "k6-test-vergemal-kartverket-salg-fast-eiendom-borettslagsandel",
    "k6-test-vergemal-statsforvalter-soke-om-samtykke-disposisjon",
    "k6-test-vergemal-bank-representasjon-dagligbank",
    "k6-test-vergemal-kommune-skatt-avgift",
    "k6-test-vergemal-nav-familie",
    "k6-test-vergemal-tingretten-begjaere-skifte-uskiftebo",
    "k6-test-vergemal-kartverket-endring-eiendom",
    "k6-test-vergemal-kartverket-laneopptak",
    "k6-test-vergemal-nav-sosiale-tjenester",
    "k6-test-vergemal-kartverket-kjop-eiendom",
    "k6-test-vergemal-ovrige-kjop-leie-varer-tjenester",
    "k6-test-vergemal-pasientreiser-refusjon-pasientreiser",
    "k6-test-vergemal-statens-innkrevingssentral-gjeldsordning-betalingsavtaler",
    "k6-test-vergemal-nav-arbeid",
];

const users = [
    "22857299381",
    "29924399935",
    "54869300376",
    "22878698650",
    "31928874918",
    "41830575322",
    "26889599226",
    "09827898373",
    "26874598916",
    "05868796989",
    "61875500782",
    "27837396412",
    "15865599576",
    "05891799685",
    "04885798794",
    "08820249535",
    "03878998862",
    "59843000198",
    "29881648693",
    "16861899717",
    "07897899552",
    "25872848536",
    "14898197930",
    "27915098059",
    "21879998945",
    "17874798320",
    "24864399386",
    "07866699199",
    "31900598311",
    "17921598211",
    "28811299458",
    "06822149098",
    "27861948698",
    "41829100558",
    "21853049465",
    "67877403103",
    "66836100752",
    "27837297619",
    "45878401100",
    "01912048841",
    "42890375027",
    "05833647484",
    "18841746895",
    "27855695796",
    "57867000374",
    "08824496022",
    "19869399402",
    "44909100280",
    "18857399699",
    "03916094824",
    "15841948073",
    "07868299252",
    "01862248038",
    "30874899204",
    "11845797570",
    "12911249497",
    "01815495566",
    "12884599782",
    "02906398012",
    "09839798137",
    "12914794836",
    "19873249075",
    "20843349650",
    "19826497397",
    "69868800399",
    "23858598850",
    "31878799901",
    "02854397799",
    "21853749653",
    "18915999383",
    "15814599598",
    "26829397667",
    "20895396533",
    "15869798212",
    "16918496339",
    "14886596589",
    "10928798297",
    "23887797536",
    "08819097136",
    "27836595713",
    "30850249888",
    "05921299194",
    "07861899009",
    "18826997342",
    "22851949759",
    "11919297567",
    "30904398353",
    "12860048998",
    "11866097552",
    "46876601125",
    "68835500938",
    "50835000556",
    "19881449555",
    "19829298204",
    "24870849172",
    "08810548380",
    "54837100731",
    "26884698331",
    "04855698884",
    "48907602519",
];

//const orgNo = "713431400"; //"991825827"; //
let orgNo = "991825827";
if (__ENV.ENVIRONMENT === "yt01") {
    orgNo = "713431400";
}
let serviceOwnerApiClient = undefined;
const label = "create-dialog";

export function setup() {
    const res = http.get(`https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/authentication/data-${__ENV.ENVIRONMENT}-all-customers.csv`);
    return parseCsvData(res.body);
}

/**
* Function to set up and return clients to interact with the Service Owner Dialog API
*
* @returns {Array} An array containing the AuthorizedPartiesClient instance
*/
export function getClients() {
    if (serviceOwnerApiClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "digdir:dialogporten.serviceprovider");
        tokenOpts.set("org", "ttd");
        tokenOpts.set("orgNo", orgNo);
        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
        serviceOwnerApiClient = new ServiceOwnerApiClient(__ENV.BASE_URL, tokenGenerator);
    }
    return [serviceOwnerApiClient];
}

export default function () {
    const [serviceOwnerApiClient] = getClients();
    const ssn = getItemFromList(users);
    const resource = getItemFromList(resources);
    const otherResource = getOtherResource(resource);
    console.log(`Creating dialog for ssn: ${ssn} and resource: ${resource}`);
    CreateDialog(
        serviceOwnerApiClient,
        ssn,
        resource,
        orgNo,
        label,
        false,
        `Dialog for ressurs ${resource}`,
        otherResource
    );
}

function getOtherResource(resource) {
    const otherResources = resources.filter(r => r !== resource);
    return getItemFromList(otherResources);
}
