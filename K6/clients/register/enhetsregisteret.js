import http from "k6/http";

const TAGS = {
    AddCcrRole: { action: "er-add-ccr-role" },
    RemoveCcrRole: { action: "er-remove-ccr-role" },
};

/**
 * The role codes ER uses in the `felttype` attribute of a change, keyed by the
 * role name Register serves its customers under. This is the whole reason the
 * client can take the role as a parameter: the batch is the same otherwise.
 *
 * @readonly
 */
const ErRoleFieldTypes = {
    revisor: "REVI",
    regnskapsforer: "REGN",
    forretningsforer: "FFØR",
};

/**
 * Client for the Altinn 2 endpoint that takes batch updates from the Central
 * Coordinating Register for Legal Entities (Enhetsregisteret, "ER").
 *
 * This is not part of the Register API and has no swagger: it is the SOAP
 * service Brønnøysundregistrene feeds role changes into, and the tests use it to
 * produce the ER event whose propagation into Register they then assert on. It
 * lives next to the Register client because that is the only thing it is used
 * for.
 *
 * Authenticated with the ER system user credentials, which go in the SOAP
 * envelope rather than in a header, so this client takes no token generator.
 */
class EnhetsregisteretClient {
    /**
     * @param {string} baseUrl Base URL, e.g. https://platform.at22.altinn.cloud.
     */
    constructor(baseUrl) {
        /**
         * Base API path.
         */
        this.BASE_PATH = "/enhets-registeret/api/v1/update.svc";

        /**
         * Fully-qualified API path. `record=false` skips archiving the batch and
         * `federate=false` keeps it from being forwarded on.
         */
        this.FULL_PATH = `${baseUrl}${this.BASE_PATH}?record=false&federate=false`;
    }

    static get TAGS() {
        return TAGS;
    }

    static get ROLE_FIELD_TYPES() {
        return ErRoleFieldTypes;
    }

    /**
     * Assigns a role in ER, making the facilitator organization the revisor,
     * regnskapsfører or forretningsfører of the client organization.
     *
     * @param {string} soapErUsername ER system user name.
     * @param {string} soapErPassword ER system user password.
     * @param {string} ccrRole The role to assign, keyed as in ErRoleFieldTypes.
     * @param {string} clientOrg Organization number of the organization getting a facilitator.
     * @param {string} facilitatorOrg Organization number of the facilitator.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Body holds the ER batch response XML.
     */
    AddCcrRole(
        soapErUsername,
        soapErPassword,
        ccrRole,
        clientOrg,
        facilitatorOrg,
        labels = null,
    ) {
        const fieldType = ErRoleFieldTypes[ccrRole];

        if (fieldType === undefined) {
            throw new Error(
                `AddCcrRole: unknown role ${ccrRole}, expected one of ${Object.keys(ErRoleFieldTypes).join(", ")}`,
            );
        }

        // endringstype="N" is the new assignment. Everything else in the batch is
        // fixed test scaffolding: one unit, one change, sent as if from BRG.
        const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
   <soapenv:Header/>
   <soapenv:Body>
      <ns:SubmitERDataBasic>
         <ns:systemUserName>${soapErUsername}</ns:systemUserName>
         <ns:systemPassword>${soapErPassword}</ns:systemPassword>
         <ns:ERData><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
<batchAjourholdXML>
  <head avsender="BRG" dato="20170714" kjoerenr="00001" mottaker="ALT" type="A" />
  <enhet organisasjonsnummer="${clientOrg}" organisasjonsform="AS" hovedsakstype="N" undersakstype="NY" foersteOverfoering="N" datoFoedt="20210315" datoSistEndret="20210315">
    <samendringer felttype="${fieldType}" endringstype="N" type="K" data="D">
      <knytningOrganisasjonsnummer>${facilitatorOrg}</knytningOrganisasjonsnummer>
    </samendringer>
  </enhet>
  <trai antallEnheter="1" avsender="BRG" />
</batchAjourholdXML>]]></ns:ERData>
      </ns:SubmitERDataBasic>
   </soapenv:Body>
</soapenv:Envelope>`;

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.AddCcrRole.action,
            ccrRole: ccrRole,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(this.FULL_PATH, body, {
            tags,
            headers: {
                "Content-Type": "text/xml",
                SOAPAction:
                    "\"http://www.altinn.no/services/Register/ER/2013/06/IRegisterERExternalBasic/SubmitERDataBasic\"",
            },
        });
    }

    /**
     * Removes a role in ER, so the facilitator organization is no longer the
     * revisor, regnskapsfører or forretningsfører of the client organization.
     *
     * @param {string} soapErUsername ER system user name.
     * @param {string} soapErPassword ER system user password.
     * @param {string} ccrRole The role to remove, keyed as in ErRoleFieldTypes.
     * @param {string} clientOrg Organization number of the organization losing a facilitator.
     * @param {string} facilitatorOrg Organization number of the facilitator.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Body holds the ER batch response XML.
     */
    RemoveCcrRole(
        soapErUsername,
        soapErPassword,
        ccrRole,
        clientOrg,
        facilitatorOrg,
        labels = null,
    ) {
        const fieldType = ErRoleFieldTypes[ccrRole];

        if (fieldType === undefined) {
            throw new Error(
                `RemoveCcrRole: unknown role ${ccrRole}, expected one of ${Object.keys(ErRoleFieldTypes).join(", ")}`,
            );
        }

        // Same batch as the add, with endringstype="U" for the removal.
        const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
   <soapenv:Header/>
   <soapenv:Body>
      <ns:SubmitERDataBasic>
         <ns:systemUserName>${soapErUsername}</ns:systemUserName>
         <ns:systemPassword>${soapErPassword}</ns:systemPassword>
         <ns:ERData><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
<batchAjourholdXML>
  <head avsender="BRG" dato="20170714" kjoerenr="00001" mottaker="ALT" type="A" />
  <enhet organisasjonsnummer="${clientOrg}" organisasjonsform="AS" hovedsakstype="N" undersakstype="NY" foersteOverfoering="N" datoFoedt="20210315" datoSistEndret="20210315">
    <samendringer felttype="${fieldType}" endringstype="U" type="K" data="D">
      <knytningOrganisasjonsnummer>${facilitatorOrg}</knytningOrganisasjonsnummer>
    </samendringer>
  </enhet>
  <trai antallEnheter="1" avsender="BRG" />
</batchAjourholdXML>]]></ns:ERData>
      </ns:SubmitERDataBasic>
   </soapenv:Body>
</soapenv:Envelope>`;

        let tags = {
            endpoint: this.FULL_PATH,
            name: this.FULL_PATH,
            action: TAGS.RemoveCcrRole.action,
            ccrRole: ccrRole,
        };

        if (labels !== null) {
            tags = {
                ...labels,
                ...tags,
            };
        }

        return http.post(this.FULL_PATH, body, {
            tags,
            headers: {
                "Content-Type": "text/xml",
                SOAPAction:
                    "\"http://www.altinn.no/services/Register/ER/2013/06/IRegisterERExternalBasic/SubmitERDataBasic\"",
            },
        });
    }
}

export { EnhetsregisteretClient, ErRoleFieldTypes };
