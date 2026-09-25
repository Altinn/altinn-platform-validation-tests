/** Stier relativt til playwright/. Miljøet bestemmer hvilken CSV-fil som leses.
 * Eksempel: testdata/privatPersonUtenVirksomhet.csv. Hver rad i CSV-filen er én testperson.
 */
export enum Testbruker {
  PrivatPersonUtenVirksomhet = "testdata/privatPersonUtenVirksomhet",
  DagligLeder = "testdata/dagligLeder",
}
