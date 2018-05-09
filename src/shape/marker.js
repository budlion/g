const Util = require('../util/index');
const Shape = require('../core/shape');
const Inside = require('./util/inside');

const Marker = function(cfg) {
  Marker.superclass.constructor.call(this, cfg);
};

Marker.Symbols = {
  // 圆
  circle(x, y, r) {
    return `M${x},${y}
            m${-r},0
            a ${r},${r},0,1,0,${r * 2},0
            a ${r},${r},0,1,0,${-r * 2},0`;
  },
  // 正方形
  square(x, y, r) {
    return `M${x - r},${y - r}
            H${x + r}V${y + r}
            H${x - r}Z`;
  },
  // 菱形
  diamond(x, y, r) {
    return  `M${x - r},${y}
             L${x},${y - r}
             L${x + r},${y},
             L${x},${y + r}Z`;
  },
  // 三角形
  triangle(x, y, r) {
    const diff = r * Math.sin((1 / 3) * Math.PI);
    return `M${x - r},${y + diff}
            L${x},${y - diff}
            L${x + r},${y + diff}Z`;
  },
  // 倒三角形
  'triangle-down': function(x, y, r) {
    const diff = r * Math.sin((1 / 3) * Math.PI);
    return `M${x - r},${y - diff}
            L${x + r},${y - diff}
            L${x},${y + diff}Z`;
  }
};

Marker.ATTRS = {
  path: null,
  lineWidth: 1
};

Util.extend(Marker, Shape);

Util.augment(Marker, {
  type: 'marker',
  canFill: true,
  canStroke: true,
  init(id) {
    Marker.superclass.init.call(this);
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    id = id || Util.uniqueId(this.type + '_');
    marker.setAttribute('id', id);
    this.setSilent('el', marker);
  },
  getDefaultAttrs() {
    return {
      x: 0,
      y: 0,
      lineWidth: 1,
      fill: 'none'
    };
  },
  __afterSetX() {
    this.__assembleShape();
  },
  __afterSetY() {
    this.__assembleShape();
  },
  __afterSetRadius() {
    this.__assembleShape();
  },
  __afterSetAttrAll(objs) {
    if ('x' in objs || 'y' in objs || 'radius' in objs) {
      this.__assembleShape();
    }
  },
  __assembleShape() {
    const attrs = this.__attrs;
    let r = attrs.r;
    if (typeof attrs.r === 'undefined') {
      r = attrs.radius;
    }
    if (isNaN(Number(attrs.x)) || isNaN(Number(attrs.y)) || isNaN(Number(r))) {
      return;
    }
    let d = '';
    if (typeof attrs.symbol === 'function') {
      let d = attrs.symbol(attrs.x, attrs.y, r);
      if (Util.isArray(d)) {
        d = d.map((path) => {
          return path.join(' ');
        }).join('');
      }
    } else {
      const d = Marker.Symbols[attrs.symbol || 'circle'](attrs.x, attrs.y, r);
    }
    this.get('el').setAttribute('d', d);
  },
  isPointInPath(x, y) {
    const attrs = this.__attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const r = attrs.radius;
    const lineWidth = this.getHitLineWidth();
    return Inside.circle(cx, cy, r + lineWidth / 2, x, y);
  },
  createPath(context) {}
});

module.exports = Marker;
