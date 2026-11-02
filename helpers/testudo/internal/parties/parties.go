// Package parties finner testpersoner og virksomheter. Kandidatene hentes fra
// Tenor, og bare de som finnes i Register for miljøet blir med, med parten
// derfra (som lib/registerEnrichment.ts i frontend).
package parties

import "github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"

// registerFelt er feltene som hentes fra Register.
var registerFelt = []register.Field{register.FieldParty, register.FieldPerson, register.FieldOrg, register.FieldUser}

// maksRegisterRunder er hvor mange ganger det hentes nye kandidater fra Tenor
// når noen ikke finnes i Register.
const maksRegisterRunder = 5
