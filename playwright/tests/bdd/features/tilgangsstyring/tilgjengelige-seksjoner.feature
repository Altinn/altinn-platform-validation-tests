#language: no

Egenskap: Tilgjengelige seksjoner i tilgangsstyring

  Scenario: Bruker ser oversikt over navigasjonsvalg bokmål
    Gitt at en innlogget bruker har åpnet siden for tilgangsstyring
    Når siden vises
    Og språket er satt til norsk bokmål
    Så skal følgende seksjoner vises:
     | Forespørsler                 |
     | Brukere                      |
     | Fullmakter                   |
     | Fullmakter hos andre         |
     | Samtykke- og fullmaktsavtaler|

  Scenario: Bruker ser oversikt over navigasjonsvalg nynorsk
    Gitt at en innlogget bruker har åpnet siden for tilgangsstyring
    Når siden vises
    Og språket er satt til norsk nynorsk
    Så skal følgende seksjoner vises:
     | Førespurnader                |
     | Brukarar                     |
     | Fullmakter                   |
     | Fullmakter hos andre         |
     | Samtykke- og fullmaktsavtaler|

  Scenario: Bruker ser oversikt over navigasjonsvalg engelsk
    Gitt at en innlogget bruker har åpnet siden for tilgangsstyring
    Når siden vises
    Og språket er satt til engelsk
    Så skal følgende seksjoner vises:
     | Requests                                 |
     | Users                                    |
     | Powers of attorney                       |
     | Powers of attorney from others           |
     | Consent and power of attorney agreements |


