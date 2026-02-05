/*
 *   Script to create resources and policies for access packages in the resource registry.
 *   Run: k6 run create-access-package-resource.js
 *   Set environment variables:
 *   ENVIRONMENT - the target environment (e.g., "yt01", "at23", "tt02")
 *   BASE_URL - the base URL of the resource registry API
 *   Example:
 *   ENVIRONMENT=yt01 BASE_URL=https://platform.at22.altinn.cloud k6 run create-access-package-resource.js
 *   Also the TOKEM_GENERATOR_USERNAME and TOKEM_GENERATOR_PASSWORD must be set in the environment for token generation
*/

import { ResourceRegistryApiClient, AccessPackagesApiClient } from "../../../../../clients/authentication/index.js";
import { EnterpriseTokenGenerator } from "../../../../../common-imports.js";
import { getResourceBody } from "./resource-templates.js";
import { getAccessPackagePolicyXml, getDefaultPolicyXml } from "./policy-builder.js";

let resourceRegistryApiClient = undefined;
let accessPackagesApiClient = undefined;

export default function () {
    let orgNo = "713431400";
    if (__ENV.ENVIRONMENT !== "yt01") {
        orgNo = "991825827";
    }
    const orgCode = "digdir";

    if (resourceRegistryApiClient == undefined) {
        const tokenOpts = new Map();
        tokenOpts.set("env", __ENV.ENVIRONMENT);
        tokenOpts.set("ttl", 3600);
        tokenOpts.set("scopes", "altinn:resourceregistry/resource.write altinn:resourceregistryresource.read altinn:resourceregistry/resource.admin");
        const tokenGenerator = new EnterpriseTokenGenerator(tokenOpts);
        resourceRegistryApiClient = new ResourceRegistryApiClient(__ENV.BASE_URL, tokenGenerator);
    }

    accessPackagesApiClient = new AccessPackagesApiClient(__ENV.BASE_URL);
    const searchOpt = { typeName: "person" };
    const accessPackageResp = accessPackagesApiClient.Search(searchOpt);

    const resp = JSON.parse(accessPackageResp.body);
    for (const item of resp) {
        const accessPackage = item.object.urn.split(":").pop();
        const resourceId = `k6-test-${accessPackage}`;
        const resourceBody = getResourceBody("access-package", resourceId, orgNo, orgCode);

        const resourceResp = resourceRegistryApiClient.PostResource(resourceBody); 
        if (resourceResp.status === 201) {
            console.log(`Resource created: ${resourceId}`);
            const policyXml = getAccessPackagePolicyXml(resourceId, accessPackage);
            const policyResp = resourceRegistryApiClient.PostPolicy(resourceId, policyXml);
            if (policyResp.status === 201) {
                console.log(`Policy created for resource: ${resourceId}`);
            }
        }
    }

}

// INFO[0002] Resource created: k6-test-innbygger-sykefravaer  source=console
// INFO[0002] Policy created for resource: k6-test-innbygger-sykefravaer  source=console
// INFO[0002] Resource created: k6-test-innbygger-attester  source=console
// INFO[0002] Policy created for resource: k6-test-innbygger-attester  source=console
// INFO[0003] Resource created: k6-test-innbygger-helsetjenester  source=console
// INFO[0003] Policy created for resource: k6-test-innbygger-helsetjenester  source=console
// INFO[0003] Resource created: k6-test-innbygger-bolig-eiendom  source=console
// INFO[0003] Policy created for resource: k6-test-innbygger-bolig-eiendom  source=console
// INFO[0003] Resource created: k6-test-innbygger-byggesoknad  source=console
// INFO[0003] Policy created for resource: k6-test-innbygger-byggesoknad  source=console
// INFO[0003] Resource created: k6-test-innbygger-pensjon   source=console
// INFO[0003] Policy created for resource: k6-test-innbygger-pensjon  source=console
// INFO[0004] Resource created: k6-test-innbygger-sertifisering  source=console
// INFO[0004] Policy created for resource: k6-test-innbygger-sertifisering  source=console
// INFO[0004] Resource created: k6-test-innbygger-arbeidsliv  source=console
// INFO[0004] Policy created for resource: k6-test-innbygger-arbeidsliv  source=console
// INFO[0004] Resource created: k6-test-innbygger-stotte-tilskudd  source=console
// INFO[0004] Policy created for resource: k6-test-innbygger-stotte-tilskudd  source=console
// INFO[0004] Resource created: k6-test-innbygger-straffesak  source=console
// INFO[0004] Policy created for resource: k6-test-innbygger-straffesak  source=console
// INFO[0004] Resource created: k6-test-innbygger-frivillighet  source=console
// INFO[0004] Policy created for resource: k6-test-innbygger-frivillighet  source=console
// INFO[0004] Resource created: k6-test-innbygger-forsikring  source=console
// INFO[0004] Policy created for resource: k6-test-innbygger-forsikring  source=console
// INFO[0004] Resource created: k6-test-innbygger-tilgangsstyring-privatperson  source=console
// INFO[0004] Policy created for resource: k6-test-innbygger-tilgangsstyring-privatperson  source=console
// INFO[0004] Resource created: k6-test-innbygger-bank-finans  source=console
// INFO[0004] Policy created for resource: k6-test-innbygger-bank-finans  source=console
// INFO[0004] Resource created: k6-test-innbygger-utdanning  source=console
// INFO[0004] Policy created for resource: k6-test-innbygger-utdanning  source=console
// INFO[0004] Resource created: k6-test-innbygger-soknader-sertifisering  source=console
// INFO[0004] Policy created for resource: k6-test-innbygger-soknader-sertifisering  source=console
// INFO[0004] Resource created: k6-test-innbygger-kjoretoy  source=console
// INFO[0004] Policy created for resource: k6-test-innbygger-kjoretoy  source=console
// INFO[0004] Resource created: k6-test-innbygger-forerkort  source=console
// INFO[0004] Policy created for resource: k6-test-innbygger-forerkort  source=console
// INFO[0004] Resource created: k6-test-innbygger-skatteforhold-privatpersoner  source=console
// INFO[0004] Policy created for resource: k6-test-innbygger-skatteforhold-privatpersoner  source=console
// INFO[0004] Resource created: k6-test-innbygger-samliv    source=console
// INFO[0004] Policy created for resource: k6-test-innbygger-samliv  source=console
// INFO[0004] Resource created: k6-test-innbygger-barn-foreldre  source=console
// INFO[0004] Policy created for resource: k6-test-innbygger-barn-foreldre  source=console
// INFO[0004] Resource created: k6-test-innbygger-permisjon-oppsigelse  source=console
// INFO[0004] Policy created for resource: k6-test-innbygger-permisjon-oppsigelse  source=console
// INFO[0004] Resource created: k6-test-innbygger-barnehage-sfo-skole  source=console
// INFO[0004] Policy created for resource: k6-test-innbygger-barnehage-sfo-skole  source=console
// INFO[0004] Resource created: k6-test-innbygger-fritidsaktiviteter-friluftsliv  source=console
// INFO[0005] Policy created for resource: k6-test-innbygger-fritidsaktiviteter-friluftsliv  source=console
// INFO[0005] Resource created: k6-test-innbygger-avlastning-stotte  source=console
// INFO[0005] Policy created for resource: k6-test-innbygger-avlastning-stotte  source=console
// INFO[0005] Resource created: k6-test-innbygger-design-varemerke  source=console
// INFO[0005] Policy created for resource: k6-test-innbygger-design-varemerke  source=console
// INFO[0005] Resource created: k6-test-innbygger-kultur    source=console
// INFO[0005] Policy created for resource: k6-test-innbygger-kultur  source=console
// INFO[0005] Resource created: k6-test-innbygger-pleie-omsorg  source=console
// INFO[0005] Policy created for resource: k6-test-innbygger-pleie-omsorg  source=console
// INFO[0005] Resource created: k6-test-innbygger-toll-avgift  source=console
// INFO[0005] Policy created for resource: k6-test-innbygger-toll-avgift  source=console
// INFO[0005] Resource created: k6-test-innbygger-idrett    source=console
// INFO[0005] Policy created for resource: k6-test-innbygger-idrett  source=console
// INFO[0005] Resource created: k6-test-innbygger-behandling  source=console
// INFO[0005] Policy created for resource: k6-test-innbygger-behandling  source=console
// INFO[0005] Resource created: k6-test-innbygger-loyve     source=console
// INFO[0005] Policy created for resource: k6-test-innbygger-loyve  source=console
// INFO[0005] Resource created: k6-test-innbygger-patent    source=console
// INFO[0005] Policy created for resource: k6-test-innbygger-patent  source=console
// INFO[0005] Resource created: k6-test-vergemal-tingretten-begjaere-uskifte  source=console
// INFO[0005] Policy created for resource: k6-test-vergemal-tingretten-begjaere-uskifte  source=console
// INFO[0005] Resource created: k6-test-vergemal-inkassoselskap-inkassoavtaler  source=console
// INFO[0005] Policy created for resource: k6-test-vergemal-inkassoselskap-inkassoavtaler  source=console
// INFO[0005] Resource created: k6-test-vergemal-ovrige-inngaelse-husleiekontrakter  source=console
// INFO[0005] Policy created for resource: k6-test-vergemal-ovrige-inngaelse-husleiekontrakter  source=console
// INFO[0005] Resource created: k6-test-vergemal-skatteetaten-melde-flytting  source=console
// INFO[0005] Policy created for resource: k6-test-vergemal-skatteetaten-melde-flytting  source=console
// INFO[0005] Resource created: k6-test-vergemal-nav-hjelpemidler  source=console
// INFO[0005] Policy created for resource: k6-test-vergemal-nav-hjelpemidler  source=console
// INFO[0005] Resource created: k6-test-vergemal-skatteetaten-endre-postadresse  source=console
// INFO[0005] Policy created for resource: k6-test-vergemal-skatteetaten-endre-postadresse  source=console
// INFO[0005] Resource created: k6-test-vergemal-skatteetaten-skatt  source=console
// INFO[0005] Policy created for resource: k6-test-vergemal-skatteetaten-skatt  source=console
// INFO[0005] Resource created: k6-test-vergemal-kartverket-avtaler-rettigheter  source=console
// INFO[0005] Policy created for resource: k6-test-vergemal-kartverket-avtaler-rettigheter  source=console
// INFO[0005] Resource created: k6-test-vergemal-kartverket-sletting  source=console
// INFO[0005] Policy created for resource: k6-test-vergemal-kartverket-sletting  source=console
// INFO[0005] Resource created: k6-test-vergemal-namsmannen-gjeldsordning  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-namsmannen-gjeldsordning  source=console
// INFO[0006] Resource created: k6-test-vergemal-kredittvurderingsselskap-kredittsperre  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-kredittvurderingsselskap-kredittsperre  source=console
// INFO[0006] Resource created: k6-test-vergemal-husbanken-bostotte  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-husbanken-bostotte  source=console
// INFO[0006] Resource created: k6-test-vergemal-ovrige-salg-losore-storre-verdi  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-ovrige-salg-losore-storre-verdi  source=console
// INFO[0006] Resource created: k6-test-vergemal-kommune-bygg-eiendom  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-kommune-bygg-eiendom  source=console
// INFO[0006] Resource created: k6-test-vergemal-namsmannen-tvangsfullbyrdelse  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-namsmannen-tvangsfullbyrdelse  source=console
// INFO[0006] Resource created: k6-test-vergemal-helfo-refusjon-privatpersoner  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-helfo-refusjon-privatpersoner  source=console
// INFO[0006] Resource created: k6-test-vergemal-helfo-fastlege  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-helfo-fastlege  source=console
// INFO[0006] Resource created: k6-test-vergemal-husbanken-startlan  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-husbanken-startlan  source=console
// INFO[0006] Resource created: k6-test-vergemal-nav-pensjon  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-nav-pensjon  source=console
// INFO[0006] Resource created: k6-test-vergemal-ovrige-avslutning-husleiekontrakter  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-ovrige-avslutning-husleiekontrakter  source=console
// INFO[0006] Resource created: k6-test-vergemal-kommune-skole-utdanning  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-kommune-skole-utdanning  source=console
// INFO[0006] Resource created: k6-test-vergemal-kartverket-arv-privat-skifte-uskifte  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-kartverket-arv-privat-skifte-uskifte  source=console
// INFO[0006] Resource created: k6-test-vergemal-kommune-sosiale-tjenester  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-kommune-sosiale-tjenester  source=console
// INFO[0006] Resource created: k6-test-vergemal-tingretten-privat-skifte-dodsbo  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-tingretten-privat-skifte-dodsbo  source=console
// INFO[0006] Resource created: k6-test-vergemal-skatteetaten-innkreving  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-skatteetaten-innkreving  source=console
// INFO[0006] Resource created: k6-test-vergemal-kommune-helse-omsorg  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-kommune-helse-omsorg  source=console
// INFO[0006] Resource created: k6-test-vergemal-forsikringsselskap-forvalte-forsikringsavtaler  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-forsikringsselskap-forvalte-forsikringsavtaler  source=console
// INFO[0006] Resource created: k6-test-vergemal-bank-ta-opp-lan-kreditter  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-bank-ta-opp-lan-kreditter  source=console
// INFO[0006] Resource created: k6-test-vergemal-kartverket-salg-fast-eiendom-borettslagsandel  source=console
// INFO[0006] Policy created for resource: k6-test-vergemal-kartverket-salg-fast-eiendom-borettslagsandel  source=console
// INFO[0006] Resource created: k6-test-vergemal-statsforvalter-soke-om-samtykke-disposisjon  source=console
// INFO[0007] Policy created for resource: k6-test-vergemal-statsforvalter-soke-om-samtykke-disposisjon  source=console
// INFO[0007] Resource created: k6-test-vergemal-bank-representasjon-dagligbank  source=console
// INFO[0007] Policy created for resource: k6-test-vergemal-bank-representasjon-dagligbank  source=console
// INFO[0007] Resource created: k6-test-vergemal-kommune-skatt-avgift  source=console
// INFO[0007] Policy created for resource: k6-test-vergemal-kommune-skatt-avgift  source=console
// INFO[0007] Resource created: k6-test-vergemal-nav-familie  source=console
// INFO[0007] Policy created for resource: k6-test-vergemal-nav-familie  source=console
// INFO[0007] Resource created: k6-test-vergemal-tingretten-begjaere-skifte-uskiftebo  source=console
// INFO[0007] Policy created for resource: k6-test-vergemal-tingretten-begjaere-skifte-uskiftebo  source=console
// INFO[0007] Resource created: k6-test-vergemal-kartverket-endring-eiendom  source=console
// INFO[0007] Policy created for resource: k6-test-vergemal-kartverket-endring-eiendom  source=console
// INFO[0007] Resource created: k6-test-vergemal-kartverket-laneopptak  source=console
// INFO[0007] Policy created for resource: k6-test-vergemal-kartverket-laneopptak  source=console
// INFO[0007] Resource created: k6-test-vergemal-nav-sosiale-tjenester  source=console
// INFO[0007] Policy created for resource: k6-test-vergemal-nav-sosiale-tjenester  source=console
// INFO[0007] Resource created: k6-test-vergemal-kartverket-kjop-eiendom  source=console
// INFO[0007] Policy created for resource: k6-test-vergemal-kartverket-kjop-eiendom  source=console
// INFO[0007] Resource created: k6-test-vergemal-ovrige-kjop-leie-varer-tjenester  source=console
// INFO[0007] Policy created for resource: k6-test-vergemal-ovrige-kjop-leie-varer-tjenester  source=console
// INFO[0007] Resource created: k6-test-vergemal-pasientreiser-refusjon-pasientreiser  source=console
// INFO[0007] Policy created for resource: k6-test-vergemal-pasientreiser-refusjon-pasientreiser  source=console
// INFO[0007] Resource created: k6-test-vergemal-statens-innkrevingssentral-gjeldsordning-betalingsavtaler  source=console
// INFO[0007] Policy created for resource: k6-test-vergemal-statens-innkrevingssentral-gjeldsordning-betalingsavtaler  source=console
// INFO[0007] Resource created: k6-test-vergemal-nav-arbeid  source=console
// INFO[0007] Policy created for resource: k6-test-vergemal-nav-arbeid  source=console

