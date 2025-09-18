import http from 'k6/http';

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
        this.tokenGenerator = tokenGenerator
        /**
         * @property {string} FULL_PATH The path to the api including protocol, hostname, etc.
         */
        this.FULL_PATH = baseUrl + "/register/api/v1"
        /**
         * @property {string} BASE_PATH The path to the api without host information
         */
        this.BASE_PATH = "/register/api/v1"
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
        const registerUrl = `${__ENV.ALTINN2_BASE_URL}/RegisterExternal/RegisterERExternalBasic.svc`

        const submitERDataBasic = '"http://www.altinn.no/services/Register/ER/2013/06/IRegisterERExternalBasic/SubmitERDataBasic"'
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
                tags: { name: registerUrl },
                headers: {
                    "Content-Type": "text/xml",
                    SOAPAction: submitERDataBasic,
                },
            }
        );
    }


    AddRevisorRoleToErForOrg(soapErUsername, soapErPassword, clientOrg, facilitatorOrg) {
        const registerUrl = `${__ENV.ALTINN2_BASE_URL}/RegisterExternal/RegisterERExternalBasic.svc`

        const submitERDataBasic = '"http://www.altinn.no/services/Register/ER/2013/06/IRegisterERExternalBasic/SubmitERDataBasic"'
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
                tags: { name: registerUrl },
                headers: {
                    "Content-Type": "text/xml",
                    SOAPAction: submitERDataBasic,
                },
            }
        );
    }

    GetRevisorCustomerIdentifiersForParty(facilitatorPartyUuid, subscriptionKey) {
        const token = this.tokenGenerator.getToken()
        const url = `${this.FULL_PATH}/internal/parties/${facilitatorPartyUuid}/customers/ccr/revisor`;

        return http.get(url,
            {
                tags: { name: `${this.FULL_PATH}/internal/parties/facilitatorPartyUuid/customers/ccr/revisor` },
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Ocp-Apim-Subscription-Key": subscriptionKey,
                },
            });
    }

}

export { RegisterApiClient }