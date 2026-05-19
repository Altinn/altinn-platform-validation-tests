import http from "k6/http";

const TAGS = {
    RemoveRevisorRoleFromEr: { action: "RemoveRevisorRoleFromEr" },
    AddRevisorRoleToErForOrg: { action: "AddRevisorRoleToErForOrg" },
    GetRevisorCustomerIdentifiersForParty: { action: "GetRevisorCustomerIdentifiersForParty" },
    SubmitErData: { action: "SubmitErData" },
};

class RegisterApiClient {
    /**
     *
     * @param {string} baseUrl e.g. https://platform.at22.altinn.cloud
     * @param {*} tokenGenerator
     */
    constructor(
        baseUrl,
        tokenGenerator
    ) {
        /**
            * @property {*} tokenGenerator A class that generates tokens used in authenticated calls to the API
            */
        this.tokenGenerator = tokenGenerator;
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + "/register/api/v1";
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/register/api/v1";
    }

    static get TAGS() {
        return TAGS;
    }
    /**
     *
     * @param {string} soapErUsername
     * @param {string} soapErPassword
     * @param {string} clientOrg
     * @param {string} facilitatorOrg
     * @returns http.RefinedResponse
     */
    RemoveRevisorRoleFromEr(soapErUsername, soapErPassword, clientOrg, facilitatorOrg) {
        const registerUrl = `${__ENV.BASE_URL}/enhets-registeret/api/v1/update.svc?record=false`;

        const submitERDataBasic = "\"http://www.altinn.no/services/Register/ER/2013/06/IRegisterERExternalBasic/SubmitERDataBasic\"";
        const soapReqBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
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

        return http.post(registerUrl, soapReqBody,
            {
                tags: { name: registerUrl, endpoint: registerUrl },
                headers: {
                    "Content-Type": "text/xml",
                    SOAPAction: submitERDataBasic,
                },
            }
        );
    }


    AddRevisorRoleToErForOrg(soapErUsername, soapErPassword, clientOrg, facilitatorOrg) {
        const registerUrl = `${__ENV.BASE_URL}/enhets-registeret/api/v1/update.svc?record=false`;

        const submitERDataBasic = "\"http://www.altinn.no/services/Register/ER/2013/06/IRegisterERExternalBasic/SubmitERDataBasic\"";
        const soapBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.altinn.no/services/Register/ER/2013/06">
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

        return http.post(registerUrl, soapBody,
            {
                tags: { name: registerUrl, endpoint: registerUrl },
                headers: {
                    "Content-Type": "text/xml",
                    SOAPAction: submitERDataBasic,
                },
            }
        );
    }

    /**
     * Posts a pre-built SOAP envelope to the ER update endpoint.
     * The caller is responsible for loading the XML file and substituting
     * ${soapErUsername} and ${soapErPassword} before passing the body here.
     *
     * @param {string} soapBody - Complete SubmitERDataBasic SOAP envelope
     * @returns http.RefinedResponse
     */
    SubmitErData(soapBody) {
        const registerUrl = `${__ENV.BASE_URL}/enhets-registeret/api/v1/update.svc?record=false`;
        const submitERDataBasic = "\"http://www.altinn.no/services/Register/ER/2013/06/IRegisterERExternalBasic/SubmitERDataBasic\"";

        return http.post(registerUrl, soapBody, {
            tags: { name: registerUrl, endpoint: registerUrl },
            headers: {
                "Content-Type": "text/xml",
                SOAPAction: submitERDataBasic,
                "X-Altinn-Register-Ccr": "Apply-In-A3",
            },
        });
    }

    GetRevisorCustomerIdentifiersForParty(facilitatorPartyUuid, subscriptionKey) {
        const token = this.tokenGenerator.getToken();
        const url = `${this.FULL_PATH}/internal/parties/${facilitatorPartyUuid}/customers/ccr/revisor`;
        return http.get(url,
            {
                tags: {
                    endpoint: `${this.FULL_PATH}/internal/parties/facilitatorPartyUuid/customers/ccr/revisor`,
                    name: `${this.FULL_PATH}/internal/parties/facilitatorPartyUuid/customers/ccr/revisor`
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Ocp-Apim-Subscription-Key": subscriptionKey,
                },
            });
    }

}

export { RegisterApiClient };
