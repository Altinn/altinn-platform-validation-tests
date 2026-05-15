# ER Sync Tests

Verifies that data submitted to the Enhetsregisteret (ER) via SOAP is correctly synced to Altinn Register. Each test submits a **prep** state (creates the organization), then a **change**, and finally verifies the change is reflected in Register.

## Running

```bash
# Run all tests
k6 run run-all.js -e ENVIRONMENT=at22 -e BASE_URL=https://platform.at22.altinn.cloud \
  -e SOAP_ER_USERNAME=<u> -e SOAP_ER_PASSWORD=<p> -e REGISTER_SUBSCRIPTION_KEY=<key>

# Run a single test
k6 run change-dagl.js <env vars>

# Stop after prep (seed state, inspect manually in portal)
k6 run change-styr.js -e STOP_AFTER_PREP=true <env vars>
k6 run run-all.js     -e STOP_AFTER_PREP=true <env vars>
```

### Required environment variables

| Variable | Description |
|---|---|
| `ENVIRONMENT` | Target environment, e.g. `at22`, `tt02` |
| `BASE_URL` | Base URL for the Register API |
| `SOAP_ER_USERNAME` | Username for the ER SOAP endpoint |
| `SOAP_ER_PASSWORD` | Password for the ER SOAP endpoint |
| `REGISTER_SUBSCRIPTION_KEY` | Subscription key for the Register API |

---

## Test cases

| File | Change tested | Verified via |
|---|---|---|
| `er-sync.js` | NAVN (short name) change | `displayName` in Register |
| `add-fmva.js` | FMVA (MVA registration) added | org visible in Register |
| `change-fadr.js` | FADR (business address) change | `businessAddress` in Register |
| `change-contact.js` | TFON, TFAX, EPOS, IADR change | contact fields in Register |
| `change-dagl.js` | DAGL (CEO) replaced | Authorized Parties for new/old DAGL |
| `change-styr.js` | STYR (board chairman) replaced | Authorized Parties for new/old STYR |

---

## batchAjourholdXML model

All ER data is submitted as XML inside a SOAP envelope. The inner XML follows the `batchAjourholdXML` format.

```xml
<batchAjourholdXML>
    <head avsender="ER" dato="20260512" kjoerenr="00201" mottaker="ALT" type="A" />
    <enhet organisasjonsnummer="..." organisasjonsform="AS" ...>
        <infotype felttype="NAVN" endringstype="N"> ... </infotype>
        <samendringer data="D" felttype="DAGL" endringstype="N" type="R"> ... </samendringer>
    </enhet>
    <trai antallEnheter="1" avsender="ER" />
</batchAjourholdXML>
```

### `<head>` attributes

| Attribute | Example | Description |
|---|---|---|
| `avsender` | `ER` | Sender — always `ER` |
| `dato` | `20260512` | Batch date (`YYYYMMDD`) |
| `kjoerenr` | `00201` | Run number — must be unique per batch |
| `mottaker` | `ALT` | Recipient — always `ALT` (Altinn) |
| `type` | `A` | Batch type — always `A` |

### `<enhet>` attributes

| Attribute | Example | Description |
|---|---|---|
| `organisasjonsnummer` | `314159265` | Organization number (9 digits, mod11 checksum) |
| `organisasjonsform` | `AS`, `ENK` | Legal form |
| `hovedsakstype` | `N`, `E` | `N` = new organization, `E` = change to existing |
| `undersakstype` | `NY`, `EN` | Sub-type of the operation |
| `foersteOverfoering` | `J`, `N` | `J` = first ever transfer of this org, `N` = subsequent update |
| `datoFoedt` | `20200101` | Date the organization was founded (`YYYYMMDD`) |
| `datoSistEndret` | `20260512` | Date last changed (`YYYYMMDD`) |

> **foersteOverfoering**: Use `J` in the prep (creating the org for the first time), `N` in the change step.

---

### `<infotype>` — Organization data fields

Used for non-role data: names, addresses, contact info, registrations.

```xml
<infotype felttype="TFON" endringstype="N">
    <opplysning>22334455</opplysning>
</infotype>
```

| `felttype` | Description | Key child element |
|---|---|---|
| `NAVN` | Organization name | `<navn1>`, `<rednavn>` |
| `FADR` | Business address (forretningsadresse) | `<adresse1>`, `<postnr>`, `<kommunenr>`, `<landkode>` |
| `PADR` | Postal address (postadresse) | same as FADR |
| `TFON` | Phone number | `<opplysning>` |
| `TFAX` | Fax number | `<opplysning>` |
| `EPOS` | Email address | `<opplysning>` |
| `IADR` | Internet address (website) | `<opplysning>` |
| `FMVA` | Voluntary VAT registration | `<opplysning>` |

**`endringstype` on infotype:**

| Value | Meaning |
|---|---|
| `N` | Ny — add or overwrite this field |
| `U` | Utgår — remove this field |

---

### `<samendringer>` — Role assignments

Used for person-to-organization role relationships.

```xml
<samendringer data="D" felttype="DAGL" endringstype="N" type="R">
    <rolleFratraadt>N</rolleFratraadt>
    <rolleRekkefoelge>1</rolleRekkefoelge>
    <rolleFoedselsnr>12345678901</rolleFoedselsnr>
    <fornavn>OLA</fornavn>
    <slektsnavn>NORDMANN</slektsnavn>
    <postnr>0150</postnr>
    <adresse1>Testveien 1</adresse1>
    <adresseLandkode>NO</adresseLandkode>
    <personstatus>L</personstatus>
</samendringer>
```

**Attributes:**

| Attribute | Value | Description |
|---|---|---|
| `data` | `D` | Data element (always `D`) |
| `felttype` | `DAGL`, `STYR`, … | Role type (see table below) |
| `endringstype` | `N` / `U` | `N` = add role, `U` = remove role |
| `type` | `R` | Role assignment (always `R`) |

**Child elements:**

| Element | Example | Description |
|---|---|---|
| `rolleFratraadt` | `N` | `N` = person is **active** in role, `J` = person has **vacated** role |
| `rolleRekkefoelge` | `1` | Sequence number when multiple persons hold the same role |
| `rolleFoedselsnr` | `12345678901` | National identity number of the person |
| `fornavn` | `OLA` | First name |
| `slektsnavn` | `NORDMANN` | Last name |
| `personstatus` | `L` | `L` = living (levende) |

**Role types (`felttype`):**

| Code | Norwegian | Description | Nøkkelrolle in Altinn |
|---|---|---|---|
| `DAGL` | Daglig leder | CEO / Managing director | Yes |
| `STYR` | Styreleder | Board chairman | Possibly — under investigation |
| `MEDL` | Styremedlem | Board member | No |
| `LEDE` | Leder | Leader (non-AS) | Yes |
| `INNH` | Innehaver | Sole proprietor owner (ENK) | Yes |

---

### Removing a role (replace pattern)

To swap one person out of a role and replace with another, send two `samendringer` blocks in the same change batch: one `U` (remove old) and one `N` (add new).

```xml
<!-- Remove old DAGL -->
<samendringer data="D" felttype="DAGL" endringstype="U" type="R">
    <rolleFoedselsnr>11111111111</rolleFoedselsnr>
</samendringer>

<!-- Add new DAGL -->
<samendringer data="D" felttype="DAGL" endringstype="N" type="R">
    <rolleFoedselsnr>22222222222</rolleFoedselsnr>
    <fornavn>NY</fornavn>
    <slektsnavn>PERSON</slektsnavn>
</samendringer>
```
