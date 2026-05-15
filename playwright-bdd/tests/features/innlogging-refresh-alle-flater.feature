# language: no

Egenskap: Innlogging beholdes på tvers av områder

  Scenariomal: Bruker er innlogget på alle flater etter innlogging
    Gitt at bruker går til "<startområde>" uten å være logget inn
    Når bruker logger inn
    Så skal bruker være innlogget på "<startområde>" også etter refresh
    Når bruker navigerer til andre områder skal bruker fortsatt være innlogget også etter refresh:
        | område              |
        | arbeidsflate        |
        | tilgangsstyring     |
        | infoportalen        |
        | arbeidsflate-profil |
    Eksempler:
      | startområde         | 
      | arbeidsflate        |
      | arbeidsflate-profil |
      | tilgangsstyring     |