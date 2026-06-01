# language: no

Egenskap: Utlogging skjer på tvers av områder

  Scenariomal: Bruker er logget ut av alle flater etter utlogging
    Gitt at bruker går til "<startområde>" uten å være logget inn
    Når bruker logger inn
    Så skal bruker være innlogget på "<landingsside>"
    Når bruker logger ut
    Så skal bruker være utlogget på infoportalen
    Og fortsatt være utlogget når bruker går til område:
        | område              |
        | arbeidsflate-profil |
        | tilgangsstyring     |
        | infoportalen        |
        | arbeidsflate-profil |
    Eksempler:
      | startområde         | landingsside |
      | arbeidsflate        | arbeidsflate        |
      | arbeidsflate-profil | arbeidsflate-profil |
      | tilgangsstyring     | tilgangsstyring     |
      | infoportalen        | arbeidsflate        |