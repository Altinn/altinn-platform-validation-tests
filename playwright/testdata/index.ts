/** Stier relativt til playwright/. Miljøet bestemmer hvilken CSV-fil som leses. */
export enum Testbruker {
  /**
   * CSV: `testdata/privatPersonUtenVirksomhet/<miljø>.csv`.
   * [at23](./privatPersonUtenVirksomhet/at23.csv) · [tt02](./privatPersonUtenVirksomhet/tt02.csv)
   */
  PrivatPersonUtenVirksomhet = "testdata/privatPersonUtenVirksomhet",
  /**
   * CSV: `testdata/dagligLeder/<miljø>.csv`.
   * [at23](./dagligLeder/at23.csv) · [tt02](./dagligLeder/tt02.csv)
   */
  DagligLeder = "testdata/dagligLeder",
}
