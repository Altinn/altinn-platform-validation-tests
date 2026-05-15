# language: no

Egenskap: Utlogging skjer på tvers av områder

  Scenariomal: Bruker er logget ut av alle flater etter utlogging
    Gitt at bruker går til "<startområde>" uten å være logget inn
    Når bruker logger inn
    Og logger ut igjen
    Så skal bruker være utlogget på alle områder:
        | område          |
        | arbeidsflate    |
        | tilgangsstyring |
        | infoportalen    |
        | arbeidsflate-profil |
    Eksempler:
      | startområde         | 
      | arbeidsflate        |
      | arbeidsflate-profil |
      | tilgangsstyring     |
      | infoportalen          |