const fs = require("fs");
const path = require("path");
const svgson = require("svgson-next").default;
const {
  convertPath,
  createLayer,
  createFile,
  createShape,
  createShapeItem,
  createEllipseShape
} = require("./lottie");

// TODO: This was for createing shapes with pre-defined color values, but probably
// isn't useful for general-purpose svg -> lottie conversion
const defaultFillColorMap = {};

async function main() {
  const inputDirectory = "input";
  const outputDirectory = "output";

  const files = fs
    .readdirSync(inputDirectory)
    .filter(filename => filename.endsWith(".svg"));

  const svgFiles = await Promise.all(
    files.map(async filename => {
      const text = fs.readFileSync(path.join(inputDirectory, filename), "utf8");
      const data = await svgson(text);
      return { filename, data };
    })
  );

  const lottieFiles = svgFiles.map(({ filename, data }) => {
    const iconName = filename.slice(0, -4);
    const defaultFill = defaultFillColorMap[iconName] || "black";

    console.log("converting", filename);

    const { type, name, attribs: { viewBox }, children } = data[0];

    const [vx, vy, vw, vh] = viewBox.split(" ").map(parseFloat);
    const file = createFile({ width: vw, height: vh });

    const shapes = [];

    children.forEach((child, index) => {
      const { type, name, attribs, children } = child;

      switch (name) {
        case "path": {
          const { d, fill } = attribs;

          const shapeItems = convertPath(d).map(points => {
            return createShapeItem(points);
          });

          const shape = createShape(shapeItems, fill || defaultFill);
          shapes.push(shape);

          break;
        }
        case "circle": {
          const { cx, cy, r, fill } = attribs;

          const item = createEllipseShape({
            x: parseFloat(cx),
            y: parseFloat(cy),
            width: parseFloat(r * 2),
            height: parseFloat(r * 2)
          });

          const shape = createShape([item], fill || defaultFill);
          shapes.push(shape);

          break;
        }
        default:
          console.log("Unused svg", type, name);
          break;
      }
    });

    const layer = createLayer(shapes.reverse());
    file.layers = [layer];

    return { filename, data: file };
  });

  lottieFiles.forEach(({ filename, data }) => {
    const outFile = path.join(
      outputDirectory,
      path.basename(filename, "svg") + "json"
    );

    fs.writeFileSync(outFile, JSON.stringify(data));
    // fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
  });
}

main();
