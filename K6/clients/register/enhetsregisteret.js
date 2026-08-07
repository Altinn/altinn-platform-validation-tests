import http from "k6/http";

const TAGS = {
    AddRevisorRole: { action: "er-add-revisor-role" },
    RemoveRevisorRole: { action: "er-remove-revisor-role" },
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
 * The `X-Altinn-Register-Ccr: Apply-In-A3` header is what makes the update land
 * in Altinn 3 rather than only in Altinn 2.
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

    /**
     * Assigns the `revisor` role in ER, making the facilitator organization the
     * auditor of the client organization.
     *
     * @param {string} soapErUsername ER system user name.
     * @param {string} soapErPassword ER system user password.
     * @param {string} clientOrg Organization number of the audited organization.
     * @param {string} facilitatorOrg Organization number of the auditor.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Body holds the ER batch response XML.
     */
    AddRevisorRole(
        soapErUsername,
        soapErPassword,
        clientOrg,
        facilitatorOrg,
        labels = null,
    ) {
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
    <samendringer felttype="REVI" endringstype="N" type="K" data="D">
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
            action: TAGS.AddRevisorRole.action,
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
                "X-Altinn-Register-Ccr": "Apply-In-A3",
            },
        });
    }

    /**
     * Removes the `revisor` role in ER, so the facilitator organization is no
     * longer the auditor of the client organization.
     *
     * @param {string} soapErUsername ER system user name.
     * @param {string} soapErPassword ER system user password.
     * @param {string} clientOrg Organization number of the audited organization.
     * @param {string} facilitatorOrg Organization number of the auditor.
     * @param {{[key: string]: string}} [labels] Optional k6 request tags.
     * @returns {http.RefinedResponse} Body holds the ER batch response XML.
     */
    RemoveRevisorRole(
        soapErUsername,
        soapErPassword,
        clientOrg,
        facilitatorOrg,
        labels = null,
    ) {
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
    <samendringer felttype="REVI" endringstype="U" type="K" data="D">
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
            action: TAGS.RemoveRevisorRole.action,
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

export { EnhetsregisteretClient };
