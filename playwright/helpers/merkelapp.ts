import { BrowserContext } from "@playwright/test";

function merk({ tekst, farge }: { tekst: string; farge: string }) {
    const merkTittel = () => {
        if (!document.title.startsWith(tekst)) {
            document.title = `${tekst} · ${document.title}`;
        }
    };
    new MutationObserver(merkTittel).observe(document, { subtree: true, childList: true, characterData: true });

    const leggTil = () => {
        merkTittel();
        const vert = document.createElement("div");
        vert.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none";
        const skygge = vert.attachShadow({ mode: "closed" });

        const ramme = document.createElement("div");
        ramme.style.cssText = `position:absolute;inset:0;border:6px solid ${farge};box-sizing:border-box`;
        const stripe = document.createElement("div");
        stripe.textContent = tekst;
        stripe.style.cssText = `position:absolute;left:0;right:0;bottom:0;padding:10px 16px;background:${farge};color:#fff;font:700 20px system-ui,sans-serif;text-align:center;letter-spacing:.02em`;
        skygge.append(ramme, stripe);
        document.body.appendChild(vert);
    };
    if (document.body) {
        leggTil();
    } else {
        document.addEventListener("DOMContentLoaded", leggTil);
    }
}

/**
 * Viser hvilken bruker en nettleserøkt tilhører, så to vinduer kan skilles fra hverandre når
 * testen debugges: `tekst` står først i fanetittelen og i en stripe langs bunnen av siden, med en
 * ramme i samme farge rundt hele siden, og
 * kommer med i video og trace. Stripa ligger oppå siden, slipper gjennom klikk og ligger i en
 * lukket shadow root, så lokatorene ikke ser den. Sider som allerede er åpne, merkes med en gang.
 */
export async function merkSesjon(kontekst: BrowserContext, tekst: string, farge: string) {
    await kontekst.addInitScript(merk, { tekst, farge });
    for (const side of kontekst.pages()) {
        await side.evaluate(merk, { tekst, farge });
    }
}
