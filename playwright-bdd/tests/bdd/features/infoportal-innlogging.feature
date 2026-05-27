# language: no

Egenskap: Innlogging infoportalen fungerer på tvers av områder

  Scenariomal: Bruker er innlogget på arbeidsflate etter innlogging på infoportalen
    Gitt at bruker går til "infoportalen" uten å være logget inn
    Når bruker logger inn
    Så skal bruker være innlogget på "arbeidsflate"
    Når bruker navigerer til andre områder skal bruker fortsatt være innlogget:
        | område          |
        | tilgangsstyring |
        | infoportalen    |