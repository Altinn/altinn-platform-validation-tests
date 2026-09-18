import { expect, Page } from "@playwright/test";
import { TestUser } from "../../config/testdata";

export class IdportenInnlogging {
  constructor(private page: Page) {}

  async login(user: TestUser) {
    await this.page.locator("#testid1").click();
    await this.page.locator('input[name="pid"]').fill(user.pid);
    await this.page.locator("#submit").click();
  }

  async assertOnPage() {
    await expect(this.page, "Er sendt til ID-porten-innlogging").toHaveURL(
      /idporten/,
    );
  }
}
