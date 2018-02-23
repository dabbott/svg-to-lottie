# svg-to-lottie

The very beginnings of an SVG -> Lottie converter.

### Strategy

First convert SVG -> JSON using `svgson` (I'm using `svgson-next`, for added features, but can't remember exactly which). Use `svgpath` to parse paths.

Then convert JSON-ified SVG + paths -> Lottie.

### Limitations

Only a small subset of SVG is supported currently. I already do the tricky path format conversion stuff -- the rest should be pretty straightfoward.

### Running

Make sure you have node 7.6+ since I use async/await.

Install dependencies with `npm install` (or `yarn`)

`node index.js` will convert all SVGs in the `input` dir and save them into the `output` dir.
