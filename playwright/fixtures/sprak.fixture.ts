import { test as base } from '@playwright/test';
import { Sprak } from '../config/sprak';

/**
 * Spraket er en option-fixture, så en test eller et helt describe-blokk kan sette
 * det med test.use({ sprak: 'nynorsk' }) i stedet for å sende det rundt som
 * argument. Default er bokmål.
 */
export const test = base.extend<{ sprak: Sprak }>({
    sprak: [Sprak.Bokmaal, { option: true }],
});
