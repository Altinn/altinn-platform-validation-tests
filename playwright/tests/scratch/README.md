# Scratch

Lokale eksperimenter som ikke sjekkes inn: alt her utenom denne fila er gitignorert.
Testene plukkes opp av `testDir`, men må tagges med et miljø for å kjøre:

```bash
npx playwright test tests/scratch/min.spec.ts --project=at23-chromium-bokmål --retries=0
```

## Gjenskape en sporadisk feil

Kjør flyten mange ganger og behold bare treffene:

```bash
npx playwright test tests/scratch/min.spec.ts --project=at23-chromium-bokmål --repeat-each=40 --retries=0
```

Hver test får sin egen testbruker, og frigir den når den er ferdig. Det er derfor
antallet samtidige tester, ikke `--repeat-each`, som er begrenset av antallet i
`testdata/`.

## Video av feilen

Ta opp i sanntid, og legg på tekst og sakte film etterpå. Senkes selve kjøringen,
med pauser eller `slowMo`, forsvinner ofte feilen.

1. **Opptak.** CDP-screencast gir mye bedre kvalitet enn Playwrights egen video.
   Lagre hver ramme med tidsstempelet:

   ```ts
   test.use({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });

   const cdp = await page.context().newCDPSession(page);
   cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
       const fil = `${mappe}/${String(frames.length).padStart(5, "0")}.jpg`;
       writeFileSync(fil, Buffer.from(data, "base64"));
       frames.push({ fil, t: metadata.timestamp });
       await cdp.send("Page.screencastFrameAck", { sessionId });
   });
   await cdp.send("Page.startScreencast", { format: "jpeg", quality: 95, maxWidth: 2560, maxHeight: 1440 });
   ```

2. **Tidslinje.** Logg `Date.now()` for teksten som skal vises og for stegene som
   skal senkes, og marker klikk med en ring i `addInitScript`, så de synes i
   opptaket.

3. **Rendering.** Med `ffmpeg-full`, som har `ass`-filteret (`brew install ffmpeg-full`):
   - Rammene settes sammen med concat-demuxeren. Sakte film og stillbilder er bare
     lengre `duration` på rammene.
   - Teksten skrives som ASS-undertekster og tegnes i et eget felt under siden,
     så den ikke dekker noe:

   ```bash
   ffmpeg -f concat -safe 0 -i liste.txt \
     -vf "fps=30,scale=2560:1440,pad=2560:1640:0:0:color=0x0a1428,ass=tekst.ass,format=yuv420p" \
     -c:v libx264 -preset slow -crf 18 -movflags +faststart feil.mp4
   ```

GitHub tar `.mp4` som vedlegg i issues.
