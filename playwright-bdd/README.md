# Test av BDD vs native playwright testing
Test av oppsett for enkelt å veksle mellom bdd og native tester for playwright.
Alt av playwright-spesifikk kode er flyttet ut i egne moduler/klasser, slik at ingen/lite logikk
ligger igjen i steps og test.steps() stegene i bdd og native, slik at de tilnærmet blir like.
## Kjøring av test
### Installer

```bash
npm install -D @playwright/test playwright-bdd

npx playwright install

```
### Test
For å kjøre alle testene 
```bash
npm run bdd
npm run native
```
For å kjøre enkelt-tester, se i `package.json` fila

