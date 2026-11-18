/** `tekst` med tegnene som betyr noe i et regulært uttrykk escapet, så den matches som den står. */
export function escapeRegex(tekst: string): string {
    return tekst.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
