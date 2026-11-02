package cmd

// Tilretteleggere (revisor, regnskapsfører og forretningsfører) for
// virksomheter --rolle. Tenor har ikke noe felt på tilretteleggeren selv som
// sier hvilken rolle den har, så de finnes via klientene: klientene har feltet
// (f.eks. revisorerOrgnr) og tilretteleggeren som en rolle i rollegrupper.

import (
	"context"
	"encoding/json"
	"fmt"
	"slices"
	"strings"
)

// tilretteleggerRolle er en rolle en virksomhet kan ha for klientene sine.
type tilretteleggerRolle struct {
	// navn er verdien i --rolle og i utskriften.
	navn string
	// felt er feltet på klienten som peker på tilretteleggeren.
	felt string
	// kode er rollekoden i klientens rollegrupper.
	kode string
}

var tilretteleggerRoller = []tilretteleggerRolle{
	{navn: "revisor", felt: "revisorerOrgnr", kode: "REVI"},
	{navn: "regnskapsfoerer", felt: "regnskapsfoerereOrgnr", kode: "REGN"},
	{navn: "forretningsfoerer", felt: "forretningsfoerereOrgnr", kode: "FFØR"},
}

// rolleNavn er gyldige verdier for --rolle, til hjelpetekst og feilmeldinger.
func rolleNavn() string {
	navn := make([]string, len(tilretteleggerRoller))
	for i, r := range tilretteleggerRoller {
		navn[i] = r.navn
	}
	return strings.Join(navn, ", ")
}

func finnTilretteleggerRolle(navn string) (tilretteleggerRolle, error) {
	i := slices.IndexFunc(tilretteleggerRoller, func(r tilretteleggerRolle) bool { return r.navn == navn })
	if i < 0 {
		return tilretteleggerRolle{}, fmt.Errorf("%w: ukjent --rolle %q, bruk en av %s", ErrInvalid, navn, rolleNavn())
	}
	return tilretteleggerRoller[i], nil
}

// tilretteleggerOppslagPerKall er hvor mange tilretteleggere som hentes i ett
// søk med organisasjonsnummer:(a or b ...).
const tilretteleggerOppslagPerKall = 50

// tilretteleggerFraKlient leser organisasjonsnummeret til tilretteleggeren med
// rollekode fra en klients rollegrupper, eller tom tekst.
func tilretteleggerFraKlient(md TenorMetadata, kode string) string {
	var kildedata struct {
		Rollegrupper []rollegruppe `json:"rollegrupper"`
	}
	if json.Unmarshal([]byte(md.Kildedata), &kildedata) != nil {
		return ""
	}
	for _, g := range kildedata.Rollegrupper {
		if g.Type.Kode != kode {
			continue
		}
		for _, r := range g.Roller {
			if r.Fratraadt != "J" && organisasjonsnummerRe.MatchString(r.Virksomhet.Organisasjonsnummer) {
				return r.Virksomhet.Organisasjonsnummer
			}
		}
	}
	return ""
}

// hentTilretteleggere henter antall tilretteleggere med rollen og daglig leder
// eller innehaver.
//
// Det gjøres i tre steg: klienter skannes til vi har nok unike kandidater,
// kandidatenes egne dokumenter hentes mange om gangen, og så filtreres de på
// daglig leder. Det hentes flere kandidater enn antall, siden noen forkastes.
func hentTilretteleggere(ctx context.Context, c *TenorClient, rolle tilretteleggerRolle, antall int) ([]Virksomhet, error) {
	kandidater := 2*antall + 10

	// Mange klienter deler tilrettelegger, så bare klienter som gir en ny
	// kandidat beholdes.
	var orgnumre []string
	sett := map[string]bool{}
	nyKandidat := func(md TenorMetadata) bool {
		orgnr := tilretteleggerFraKlient(md, rolle.kode)
		if orgnr == "" || sett[orgnr] {
			return false
		}
		sett[orgnr] = true
		orgnumre = append(orgnumre, orgnr)
		return true
	}
	if _, err := c.HentMangeFiltrert(ctx, KildeBrreg, Finnes(rolle.felt), kandidater, nyKandidat); err != nil {
		return nil, err
	}

	dokumenter, err := hentPaaOrganisasjonsnummer(ctx, c, orgnumre)
	if err != nil {
		return nil, err
	}
	tilretteleggere := make([]Virksomhet, 0, len(orgnumre))
	for _, orgnr := range orgnumre {
		md, ok := dokumenter[orgnr]
		if !ok {
			continue
		}
		v, ok := tilVirksomhet(md)
		if !ok || v.DagligLeder == "" {
			continue
		}
		v.Rolle = rolle.navn
		tilretteleggere = append(tilretteleggere, v)
	}
	return tilretteleggere[:min(antall, len(tilretteleggere))], nil
}

// hentPaaOrganisasjonsnummer henter brreg-dokumentene til virksomhetene, mange
// om gangen.
func hentPaaOrganisasjonsnummer(ctx context.Context, c *TenorClient, orgnumre []string) (map[string]TenorMetadata, error) {
	dokumenter := make(map[string]TenorMetadata, len(orgnumre))
	for start := 0; start < len(orgnumre); start += tilretteleggerOppslagPerKall {
		batch := orgnumre[start:min(start+tilretteleggerOppslagPerKall, len(orgnumre))]
		res, err := c.Soek(ctx, KildeBrreg, SoekParams{
			KQL:    "organisasjonsnummer:(" + strings.Join(batch, " or ") + ")",
			Antall: Ptr(int32(len(batch))),
			Vis:    []string{"tenorMetadata"},
		})
		if err != nil {
			return nil, err
		}
		for _, d := range res.DokumentListe {
			md, err := LesTenorMetadata(d)
			if err == nil && md.ID != "" {
				dokumenter[md.ID] = md
			}
		}
	}
	return dokumenter, nil
}
