package cmd

// Felles for --register: slår opp Tenor-identifikatorer i Register, som
// lib/registerEnrichment.ts i frontend.

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
)

// registerFelt er feltene som hentes for --register.
var registerFelt = []PartyFelt{FeltParty, FeltPerson, FeltOrg, FeltUser}

// slaaOppIRegister slår opp identifikatorene og skriver til logg hvor mange
// som ikke finnes i miljoe.
func slaaOppIRegister(ctx context.Context, reg *RegisterClient, identifikatorer []string, miljoe string, logg io.Writer) (map[string]Party, error) {
	parter, err := reg.SlaaOppIdentifikatorer(ctx, identifikatorer, registerFelt...)
	if err != nil {
		return nil, err
	}
	mangler := map[string]bool{}
	for _, id := range identifikatorer {
		if _, ok := parter[id]; !ok {
			mangler[id] = true
		}
	}
	if len(mangler) > 0 {
		fmt.Fprintf(logg, "Register (%s): %d identifikatorer mangler; altinn = null.\n", miljoe, len(mangler))
	}
	return parter, nil
}

// brukerID, partyID og partyUUID henter ID-er fra en part, eller tom tekst
// når parten eller verdien mangler.
func brukerID(p *Party) string {
	if p == nil || p.User == nil {
		return ""
	}
	return tallTekst(p.User.UserID)
}

func partyID(p *Party) string {
	if p == nil {
		return ""
	}
	return tallTekst(p.PartyID)
}

func partyUUID(p *Party) string {
	if p == nil {
		return ""
	}
	return p.PartyUUID
}

// visningsnavn er displayName fra Register når det finnes, ellers navnet fra
// Tenor.
func visningsnavn(p *Party, tenorNavn string) string {
	if p != nil && p.DisplayName != "" {
		return p.DisplayName
	}
	return tenorNavn
}

func skrivJSON(ut io.Writer, v any) error {
	enc := json.NewEncoder(ut)
	enc.SetIndent("", "  ")
	return enc.Encode(v)
}
