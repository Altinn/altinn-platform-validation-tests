package cmd

// Hjelpere for å bygge KQL-spørringer mot Tenor. Feltnavn og verdier for freg
// er hentet fra Tenor sin "Avansert søk"-dokumentasjon for Folkeregisteret.

import (
	"fmt"
	"strings"
	"time"
)

// KQLDato er datoformatet Tenor bruker i KQL, f.eks. foedselsdato>1970-01-01.
const KQLDato = "2006-01-02"

// Myndighetsalder er alderen en person regnes som myndig fra.
const Myndighetsalder = 18

// Sammenligning er en operator for tall- og datofelt.
type Sammenligning string

const (
	StoerreEnn    Sammenligning = ">"
	StoerreEnnLik Sammenligning = ">="
	MindreEnn     Sammenligning = "<"
	MindreEnnLik  Sammenligning = "<="
)

// Er gir felt:"verdi". Verdien siteres, så mellomrom og spesialtegn er trygt.
func Er(felt, verdi string) string {
	return felt + ":" + sitat(verdi)
}

// ErEnAv gir felt:("a" or "b" ...).
func ErEnAv(felt string, verdier ...string) string {
	siterte := make([]string, len(verdier))
	for i, v := range verdier {
		siterte[i] = sitat(v)
	}
	return felt + ":(" + strings.Join(siterte, " or ") + ")"
}

// Finnes gir felt:*, som treffer alle dokumenter som har feltet uansett verdi.
func Finnes(felt string) string {
	return felt + ":*"
}

// ErSann gir felt:true eller felt:false for boolske felt.
func ErSann(felt string, verdi bool) string {
	return fmt.Sprintf("%s:%t", felt, verdi)
}

// Sammenlign gir f.eks. navnLengde>50 eller foedselsdato>=1970-01-01.
func Sammenlign(felt string, op Sammenligning, verdi string) string {
	return felt + string(op) + verdi
}

// Intervall gir felt:[fra to til]. Tom grense blir *, dvs. åpen.
func Intervall(felt, fra, til string) string {
	if fra == "" {
		fra = "*"
	}
	if til == "" {
		til = "*"
	}
	return fmt.Sprintf("%s:[%s to %s]", felt, fra, til)
}

// DatoIntervall er Intervall med datoer. Null-tid blir åpen grense.
func DatoIntervall(felt string, fra, til time.Time) string {
	return Intervall(felt, formaterDato(fra), formaterDato(til))
}

// Nestet søker i et nestet objekt, f.eks.
// Nestet("tenorRelasjoner.arbeidsforhold", Er("ansettelsesform", "fast")).
func Nestet(felt, indre string) string {
	return felt + ":{" + indre + "}"
}

// Og slår sammen deluttrykk med AND. Tomme deler hoppes over.
func Og(deler ...string) string {
	return kombiner(" AND ", deler)
}

// Eller slår sammen deluttrykk med OR. Tomme deler hoppes over.
func Eller(deler ...string) string {
	return kombiner(" OR ", deler)
}

// Ikke negerer et uttrykk.
func Ikke(uttrykk string) string {
	return "NOT (" + uttrykk + ")"
}

// BosattMyndigKQL gir personer med personstatus bosatt som har fylt 18 år
// på datoen naa.
func BosattMyndigKQL(naa time.Time) string {
	senest := naa.UTC().AddDate(-Myndighetsalder, 0, 0)
	return Og(
		Er(FregPersonstatus, PersonstatusBosatt),
		DatoIntervall(FregFoedselsdato, time.Time{}, senest),
	)
}

func kombiner(sep string, deler []string) string {
	ikkeTomme := make([]string, 0, len(deler))
	for _, d := range deler {
		if d = strings.TrimSpace(d); d != "" {
			ikkeTomme = append(ikkeTomme, d)
		}
	}
	if len(ikkeTomme) == 1 {
		return ikkeTomme[0]
	}
	for i, d := range ikkeTomme {
		ikkeTomme[i] = "(" + d + ")"
	}
	return strings.Join(ikkeTomme, sep)
}

func sitat(v string) string {
	v = strings.ReplaceAll(v, `\`, `\\`)
	v = strings.ReplaceAll(v, `"`, `\"`)
	return `"` + v + `"`
}

func formaterDato(t time.Time) string {
	if t.IsZero() {
		return ""
	}
	return t.Format(KQLDato)
}

// Feltnavn i freg (Folkeregisteret).
const (
	// Adresse
	FregAdresseBeskyttelse                 = "adresseBeskyttelse"
	FregAdresseGradering                   = "adresseGradering"
	FregBorMedFar                          = "borMedFar"
	FregBorMedMor                          = "borMedMor"
	FregBorMedMedmor                       = "borMedMedmor"
	FregBostedsadresse                     = "bostedsadresse"
	FregBostedsadresseType                 = "bostedsadresseType"
	FregCoAdressenavnType                  = "coAdressenavnType"
	FregDeltBosted                         = "deltBosted"
	FregForeldreHarSammeAdresse            = "foreldreHarSammeAdresse"
	FregHarBostedsadresseHistorikk         = "harBostedsadresseHistorikk"
	FregHarPostadresseIFrittFormat         = "harPostadresseIFrittFormat"
	FregHarPostboks                        = "harPostboks"
	FregHarPostadressePostboks             = "harPostadressePostboks"
	FregHarPostadresseVegadresse           = "harPostadresseVegadresse"
	FregKommunenr                          = "kommunenr"
	FregOppholdAnnetSted                   = "oppholdAnnetSted"
	FregOppholdsadresseType                = "oppholdsadresseType"
	FregPostadresse                        = "postadresse"
	FregPostadresseUtland                  = "postadresseUtland"
	FregHarUtenlandskPostadressePostboks   = "harUtenlandskPostadressePostboks"
	FregHarUtenlandskPostadresseVegadresse = "harUtenlandskPostadresseVegadresse"
	FregHarUtenlandskAdresseIFrittFormat   = "harUtenlandskAdresseIFrittFormat"
	FregUkjentBosted                       = "ukjentBosted"
	FregAdresseSpesialtegn                 = "adresseSpesialtegn"
	FregSisteBoKommune                     = "sisteBoKommune"

	// Navn
	FregEtternavn        = "etternavn"
	FregFlereFornavn     = "flereFornavn"
	FregFornavn          = "fornavn"
	FregHarNavnHistorikk = "harNavnHistorikk"
	FregMellomnavn       = "mellomnavn"
	FregNavnLengde       = "navnLengde"
	FregVisningnavn      = "visningnavn"
	FregNavnSpesialtegn  = "navnSpesialtegn"

	// Inn- og utflytting
	FregHarInnflytting = "harInnflytting"
	FregHarUtflytting  = "harUtflytting"

	// Sivilstand
	FregHarSivilstandHistorikk = "harSivilstandHistorikk"
	FregSivilstand             = "sivilstand"

	// Fødselsdato, identifikasjon og status
	FregHarAvvikFdato                  = "harAvvikFdato"
	FregFoedselsdato                   = "foedselsdato"
	FregID                             = "id"
	FregIdentifikator                  = "identifikator"
	FregIdentifikatorType              = "identifikatorType"
	FregIdentitetsgrunnlagStatus       = "identitetsgrunnlagStatus"
	FregLegitimasjonsdokument          = "legitimasjonsdokument"
	FregUtenlandskPersonidentifikasjon = "utenlandskPersonidentifikasjon"
	FregPersonstatus                   = "personstatus"

	// Dødsfall
	FregDoedsdato          = "doedsdato"
	FregKontaktinfoDoedsbo = "kontaktinfoDoedsbo"

	// Familierelasjoner
	FregAntallBarn                                      = "antallBarn"
	FregForeldreansvar                                  = "foreldreansvar"
	FregHarDoedfoedtBarn                                = "harDoedfoedtBarn"
	FregHarForeldreMedSammeKjoenn                       = "harForeldreMedSammeKjoenn"
	FregBarnFnr                                         = "barnFnr"
	FregFarFnr                                          = "farFnr"
	FregMedmorFnr                                       = "medmorFnr"
	FregMorFnr                                          = "morFnr"
	FregPartnerFnr                                      = "partnerFnr"
	FregMinRolleForPerson                               = "minRolleForPerson"
	FregRelatertPersonsRolle                            = "relatertPersonsRolle"
	FregHarRelatertPersonUtenFolkeregisteridentifikator = "harRelatertPersonUtenFolkeregisteridentifikator"

	// Diverse
	FregFalskIdentitet         = "falskIdentitet"
	FregFoedeland              = "foedeland"
	FregHarOpphold             = "harOpphold"
	FregOppholdstillatelseType = "oppholdstillatelseType"
	FregKjoenn                 = "kjoenn"

	// Statsborgerskap
	FregNorskStatsborgerskap        = "norskStatsborgerskap"
	FregStatsborgerskap             = "statsborgerskap"
	FregFlereStatsborgerskap        = "flereStatsborgerskap"
	FregNordenStatsborgerskap       = "nordenStatsborgerskap"
	FregEuEoesStatsborgerskap       = "euEoesStatsborgerskap"
	FregTredjelandStatsborgerskap   = "tredjelandStatsborgerskap"
	FregUtgaattStatsborgerskap      = "utgaattStatsborgerskap"
	FregHarStatsborgerskapHistorikk = "harStatsborgerskapHistorikk"

	// Vergemål og rettslig handleevne
	FregVergemaalType           = "vergemaalType"
	FregVergeTjenestevirksomhet = "vergeTjenestevirksomhet"
	FregVergeTjenesteoppgave    = "vergeTjenesteoppgave"
	FregHarRettsligHandleevne   = "harRettsligHandleevne"

	// Tenor-data, relasjoner og hendelser
	FregTenorOpprettet  = "tenorMetadata.opprettet"
	FregTenorOppdatert  = "tenorMetadata.oppdatert"
	FregTenorRelasjoner = "tenorRelasjoner"
	FregHendelser       = "hendelser"
	FregSisteHendelse   = "sisteHendelse"
)

// Verdier for freg-felt. Bare verdiene dokumentasjonen nevner er tatt med;
// feltene kan ha flere.
const (
	PersonstatusBosatt = "bosatt"

	AdresseBeskyttelseFortrolig        = "fortrolig"
	AdresseBeskyttelseStrengtFortrolig = "strengtFortrolig"

	AdresseGraderingUgradert      = "ugradert"
	AdresseGraderingFortrolig     = "fortrolig"
	AdresseGraderingKlientadresse = "klientadresse"

	AdresseTypeMatrikkel  = "matrikkel"
	AdresseTypeVeiadresse = "veiadresse"
	AdresseTypeUkjent     = "ukjent"

	CoAdressenavnBostedsadresse       = "bostedsadresse"
	CoAdressenavnDeltBosted           = "deltBosted"
	CoAdressenavnOppholdsadresse      = "oppholdsadresse"
	CoAdressenavnPostadresse          = "postadresse"
	CoAdressenavnPostadresseIUtlandet = "postadresseIUtlandet"

	OppholdAnnetStedMilitaer    = "militaer"
	OppholdAnnetStedPendler     = "pendler"
	OppholdAnnetStedUtenriks    = "utenriks"
	OppholdAnnetStedPaaSvalbard = "paaSvalbard"

	SivilstandEnkeEllerEnkemann  = "enkeEllerEnkemann"
	SivilstandGift               = "gift"
	SivilstandGjenlevendePartner = "gjenlevendePartner"
	SivilstandRegistrertPartner  = "registrertPartner"
	SivilstandSeparert           = "separert"
	SivilstandSeparertPartner    = "separertPartner"
	SivilstandSkilt              = "skilt"
	SivilstandSkiltPartner       = "skiltPartner"
	SivilstandUgift              = "ugift"
	SivilstandUoppgitt           = "uoppgitt"

	IdentifikatorTypeDNummer             = "dNummer"
	IdentifikatorTypeDNummerOgFoedselsnr = "dNummerOgFoedselsnr"
	IdentifikatorTypeFoedselsnummer      = "foedselsnummer"

	IdentitetsgrunnlagIkkeKontrollert = "ikkeKontrollert"
	IdentitetsgrunnlagIngenStatus     = "ingenStatus"
	IdentitetsgrunnlagKontrollert     = "kontrollert"

	KontaktinfoDoedsboAdvokat      = "advokat"
	KontaktinfoDoedsboOrganisasjon = "organisasjon"
	KontaktinfoDoedsboPerson       = "person"

	ForeldreansvarMor    = "mor"
	ForeldreansvarFar    = "far"
	ForeldreansvarFelles = "felles"
	ForeldreansvarAndre  = "andre"
	ForeldreansvarUkjent = "ukjent"
	ForeldreansvarMedmor = "medmor"

	RolleBarn                  = "barn"
	RolleMor                   = "mor"
	RolleFar                   = "far"
	RolleMedmor                = "medmor"
	RolleEktefelleEllerPartner = "ektefelleEllerPartner"
	RolleDoedfoedtBarn         = "doedfoedtBarn"

	OppholdstillatelseMidlertidig       = "midlertidig"
	OppholdstillatelsePermanent         = "permanent"
	OppholdstillatelseOpplysningMangler = "opplysningMangler"

	KjoennMann   = "mann"
	KjoennKvinne = "kvinne"
)
