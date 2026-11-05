// Package parties finds test persons and organizations. The candidates are
// fetched from Tenor, and only those that exist in Register for the
// environment are kept, with the party from there (like
// lib/registerEnrichment.ts in the frontend).
package parties

import "github.com/Altinn/altinn-platform-validation-tests/helpers/testudo/internal/register"

// registerFields are the fields fetched from Register.
var registerFields = []register.Field{register.FieldParty, register.FieldPerson, register.FieldOrg, register.FieldUser}

// maxRegisterRounds is how many times new candidates are fetched from Tenor
// when some do not exist in Register.
const maxRegisterRounds = 5
