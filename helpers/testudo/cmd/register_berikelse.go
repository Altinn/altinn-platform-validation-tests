package cmd

// Felles for oppslag i Register, som lib/registerEnrichment.ts i frontend.

import (
	"encoding/json"
	"io"
)

// registerFelt er feltene som hentes fra Register.
var registerFelt = []PartyFelt{FeltParty, FeltPerson, FeltOrg, FeltUser}

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

func skrivJSON(ut io.Writer, v any) error {
	enc := json.NewEncoder(ut)
	enc.SetIndent("", "  ")
	return enc.Encode(v)
}
