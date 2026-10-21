# Rhythm Room

A classroom rhythm practice app with a one-line staff, recorded instruments, a bouncing beat ball, and listen/play rounds.

## Run

Serve this folder with any static web server. For example:

```sh
python -m http.server 8000
```

Open http://localhost:8000 in a modern browser and press **Start loop** to enable sound. No build step, dependencies, account, or API keys are required.

## GitHub Pages

1. Create a GitHub repository and upload the contents of this folder. Keep `index.html`, `audio/`, and `fonts/` at the repository root.
2. In the repository, open **Settings → Pages**.
3. Choose **Deploy from a branch**, then select `main` and `/ (root)` and save.
4. Open the Pages link shown by GitHub once deployment completes.

## Practice controls

Select rhythm building blocks, choose a tempo and instrument, and start the loop. Each rhythm plays once with the Listen cue, repeats with the drum cue, then is replaced by a new random rhythm. Choose whether the app accompanies the students during their turn.

Single eighth notes unlock basic syncopations when the other required note types are selected. Paired eighth notes alone do not. Adjacent short notes are beamed and consecutive rests are consolidated while preserving beat boundaries. Dotted sixteenth notes are excluded.

## Included assets and credits

- Bravura music font, Steinberg Media Technologies: SIL Open Font License 1.1. See `fonts/Bravura-LICENSE.txt`.
- Acoustic snare, Karoryfer Samples / Frankensnare: CC0. See `audio/LICENSE-Frankensnare.txt`.
- Recorded piano and organ, Versilian Studios / VSO2, distributed by Nicholaus Brosowsky's tonejs-instruments: CC BY 3.0. See `audio/CREDITS.txt` and `audio/organ-source-info.txt`.

Keep the bundled asset credits and licenses with redistributed copies.
