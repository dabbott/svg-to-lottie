const svgpath = require("svgpath");
const { parseCSSColor } = require("csscolorparser");

function convertPath(string) {
  const parsed = svgpath(string);

  parsed.unarc();
  parsed.unshort();
  parsed.abs();

  const groups = [];
  const curvePoints = [];

  function convertPoints(curvePoints, isClosed) {
    return curvePoints.reduce(
      (result, curvePoint) => {
        const { point, curveFrom, curveTo } = curvePoint;
        const { i, o, v } = result;

        i.push(curveFrom);
        o.push(curveTo);
        v.push(point);

        return result;
      },
      { i: [], o: [], v: [], c: isClosed }
    );
  }

  parsed.iterate(function convert(segment, index, x, y) {
    const [command, ...parameters] = segment;

    switch (command) {
      case "M": {
        const [x, y] = parameters;
        curvePoints.push({
          point: [x, y],
          curveFrom: [0, 0],
          curveTo: [0, 0]
        });
        break;
      }
      case "L": {
        const [x, y] = parameters;
        curvePoints.push({
          point: [x, y],
          curveFrom: [0, 0],
          curveTo: [0, 0]
        });
        break;
      }
      case "H": {
        const [x] = parameters;
        curvePoints.push({
          point: [x, y],
          curveFrom: [0, 0],
          curveTo: [0, 0]
        });
        break;
      }
      case "V": {
        const [y] = parameters;
        curvePoints.push({
          point: [x, y],
          curveFrom: [0, 0],
          curveTo: [0, 0]
        });
        break;
      }
      case "Z": {
        curvePoints.push({
          point: [x, y],
          curveFrom: [0, 0],
          curveTo: [0, 0]
        });

        groups.push(convertPoints(curvePoints, true));
        curvePoints.length = 0;
        break;
      }
      case "Q": {
        let [qx1, qy1, qx2, qy2] = parameters;

        const x1 = x + 2 / 3 * (qx1 - x);
        const y1 = y + 2 / 3 * (qy1 - y);

        const x2 = qx2 + 2 / 3 * (qx1 - qx2);
        const y2 = qy2 + 2 / 3 * (qy1 - qy2);

        const x3 = qx2;
        const y3 = qy2;

        curvePoints.push({
          curveFrom: [0, 0],
          point: [x, y],
          curveTo: [x1 - x, y1 - y]
        });

        curvePoints.push({
          curveFrom: [x2 - x3, y2 - y3],
          point: [x3, y3],
          curveTo: [0, 0]
        });
        break;
      }
      case "C": {
        const [x1, y1, x2, y2, x3, y3] = parameters;

        curvePoints.push({
          curveFrom: [0, 0],
          point: [x, y],
          curveTo: [x1 - x, y1 - y]
        });

        curvePoints.push({
          curveFrom: [x2 - x3, y2 - y3],
          point: [x3, y3],
          curveTo: [0, 0]
        });
        break;
      }
      default:
        console.log("not used", segment);
    }
  });

  if (curvePoints.length > 0) {
    groups.push(convertPoints(curvePoints, false));
  }

  return groups;
}

function createEllipseShape({ x, y, width, height }) {
  return {
    d: 1,
    ty: "el",
    s: {
      a: 0,
      k: [width, height],
      ix: 2
    },
    p: {
      a: 0,
      k: [x, y],
      ix: 3
    },
    nm: "Ellipse Path 1",
    mn: "ADBE Vector Shape - Ellipse",
    hd: false
  };
}

function createShapeItem(points) {
  return {
    hd: false,
    ind: 0,
    ix: 1,
    ks: {
      a: 0,
      ix: 2,
      k: points
    },
    mn: "ADBE Vector Shape - Group",
    nm: "Path 1",
    ty: "sh"
  };
}

function createShape(items, fillString) {
  const fillColor = parseCSSColor(fillString);

  return {
    cix: 2,
    hd: false,
    it: [
      ...items,
      {
        c: {
          a: 0,
          ix: 4,
          k: [
            fillColor[0] / 255,
            fillColor[1] / 255,
            fillColor[2] / 255,
            fillColor[3] || 1
          ]
        },
        hd: false,
        mn: "ADBE Vector Graphic - Fill",
        nm: "Fill 1",
        o: {
          a: 0,
          ix: 5,
          k: 100
        },
        r: 1,
        ty: "fl"
      },
      {
        a: {
          a: 0,
          ix: 1,
          k: [0, 0]
        },
        nm: "Transform",
        o: {
          a: 0,
          ix: 7,
          k: 100
        },
        p: {
          a: 0,
          ix: 2,
          k: [0, 0]
        },
        r: {
          a: 0,
          ix: 6,
          k: 0
        },
        s: {
          a: 0,
          ix: 3,
          k: [100, 100]
        },
        sa: {
          a: 0,
          ix: 5,
          k: 0
        },
        sk: {
          a: 0,
          ix: 4,
          k: 0
        },
        ty: "tr"
      }
    ],
    ix: 1,
    mn: "ADBE Vector Group",
    nm: "Shape 1",
    np: 3,
    ty: "gr"
  };
}

function createLayer(shapes) {
  return {
    shapes,
    ao: 0,
    bm: 0,
    ddd: 0,
    ind: 1,
    ip: 0,
    ks: {
      a: {
        a: 0,
        ix: 1,
        k: [0, 0, 0]
      },
      o: {
        a: 0,
        ix: 11,
        k: 100
      },
      p: {
        a: 0,
        ix: 2,
        k: [0, 0, 0]
      },
      r: {
        a: 0,
        ix: 10,
        k: 0
      },
      s: {
        a: 0,
        ix: 6,
        k: [100, 100, 100]
      }
    },
    nm: "Shape Layer 1",
    op: 120,
    sr: 1,
    st: 0,
    ty: 4
  };
}

function createFile(options) {
  const { width, height } = options;

  return {
    assets: [],
    ddd: 0,
    fr: 24,
    h: height,
    ip: 0,
    nm: "Comp 1",
    op: 120,
    v: "4.12.0",
    w: width
  };
}

module.exports = {
  createShapeItem,
  createEllipseShape,
  createShape,
  createLayer,
  createFile,
  convertPath
};
