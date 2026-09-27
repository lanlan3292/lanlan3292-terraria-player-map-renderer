// node_modules/fflate/esm/browser.js
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1];
  }
  var r = new i32(b[30]);
  for (var i = 1; i < 30; ++i) {
    for (var j = b[i]; j < b[i + 1]; ++j) {
      r[j] = j - b[i] << 5 | i;
    }
  }
  return { b, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = function(cd, mb, r) {
  var s = cd.length;
  var i = 0;
  var l = new u16(mb);
  for (; i < s; ++i) {
    if (cd[i])
      ++l[cd[i] - 1];
  }
  var le = new u16(mb);
  for (i = 1; i < mb; ++i) {
    le[i] = le[i - 1] + l[i - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v = le[cd[i] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
      }
    }
  }
  return co;
};
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flm = /* @__PURE__ */ hMap(flt, 9, 0);
var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var wbits = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
};
var wbits16 = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
  d[o + 2] |= v >> 16;
};
var hTree = function(d, mb) {
  var t = [];
  for (var i = 0; i < d.length; ++i) {
    if (d[i])
      t.push({ s: i, f: d[i] });
  }
  var s = t.length;
  var t2 = t.slice();
  if (!s)
    return { t: et, l: 0 };
  if (s == 1) {
    var v = new u8(t[0].s + 1);
    v[t[0].s] = 1;
    return { t: v, l: 1 };
  }
  t.sort(function(a, b) {
    return a.f - b.f;
  });
  t.push({ s: -1, f: 25001 });
  var l = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
  t[0] = { s: -1, f: l.f + r.f, l, r };
  while (i1 != s - 1) {
    l = t[t[i0].f < t[i2].f ? i0++ : i2++];
    r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
    t[i1++] = { s: -1, f: l.f + r.f, l, r };
  }
  var maxSym = t2[0].s;
  for (var i = 1; i < s; ++i) {
    if (t2[i].s > maxSym)
      maxSym = t2[i].s;
  }
  var tr = new u16(maxSym + 1);
  var mbt = ln(t[i1 - 1], tr, 0);
  if (mbt > mb) {
    var i = 0, dt = 0;
    var lft = mbt - mb, cst = 1 << lft;
    t2.sort(function(a, b) {
      return tr[b.s] - tr[a.s] || a.f - b.f;
    });
    for (; i < s; ++i) {
      var i2_1 = t2[i].s;
      if (tr[i2_1] > mb) {
        dt += cst - (1 << mbt - tr[i2_1]);
        tr[i2_1] = mb;
      } else
        break;
    }
    dt >>= lft;
    while (dt > 0) {
      var i2_2 = t2[i].s;
      if (tr[i2_2] < mb)
        dt -= 1 << mb - tr[i2_2]++ - 1;
      else
        ++i;
    }
    for (; i >= 0 && dt; --i) {
      var i2_3 = t2[i].s;
      if (tr[i2_3] == mb) {
        --tr[i2_3];
        ++dt;
      }
    }
    mbt = mb;
  }
  return { t: new u8(tr), l: mbt };
};
var ln = function(n, l, d) {
  return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
};
var lc = function(c) {
  var s = c.length;
  while (s && !c[--s])
    ;
  var cl = new u16(++s);
  var cli = 0, cln = c[0], cls = 1;
  var w = function(v) {
    cl[cli++] = v;
  };
  for (var i = 1; i <= s; ++i) {
    if (c[i] == cln && i != s)
      ++cls;
    else {
      if (!cln && cls > 2) {
        for (; cls > 138; cls -= 138)
          w(32754);
        if (cls > 2) {
          w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
          cls = 0;
        }
      } else if (cls > 3) {
        w(cln), --cls;
        for (; cls > 6; cls -= 6)
          w(8304);
        if (cls > 2)
          w(cls - 3 << 5 | 8208), cls = 0;
      }
      while (cls--)
        w(cln);
      cls = 1;
      cln = c[i];
    }
  }
  return { c: cl.subarray(0, cli), n: s };
};
var clen = function(cf, cl) {
  var l = 0;
  for (var i = 0; i < cl.length; ++i)
    l += cf[i] * cl[i];
  return l;
};
var wfblk = function(out, pos, dat) {
  var s = dat.length;
  var o = shft(pos + 2);
  out[o] = s & 255;
  out[o + 1] = s >> 8;
  out[o + 2] = out[o] ^ 255;
  out[o + 3] = out[o + 1] ^ 255;
  for (var i = 0; i < s; ++i)
    out[o + i + 4] = dat[i];
  return (o + 4 + s) * 8;
};
var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
  wbits(out, p++, final);
  ++lf[256];
  var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
  var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
  var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
  var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
  var lcfreq = new u16(19);
  for (var i = 0; i < lclt.length; ++i)
    ++lcfreq[lclt[i] & 31];
  for (var i = 0; i < lcdt.length; ++i)
    ++lcfreq[lcdt[i] & 31];
  var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
  var nlcc = 19;
  for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
    ;
  var flen = bl + 5 << 3;
  var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
  var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
  if (bs >= 0 && flen <= ftlen && flen <= dtlen)
    return wfblk(out, p, dat.subarray(bs, bs + bl));
  var lm, ll, dm, dl;
  wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
  if (dtlen < ftlen) {
    lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
    var llm = hMap(lct, mlcb, 0);
    wbits(out, p, nlc - 257);
    wbits(out, p + 5, ndc - 1);
    wbits(out, p + 10, nlcc - 4);
    p += 14;
    for (var i = 0; i < nlcc; ++i)
      wbits(out, p + 3 * i, lct[clim[i]]);
    p += 3 * nlcc;
    var lcts = [lclt, lcdt];
    for (var it = 0; it < 2; ++it) {
      var clct = lcts[it];
      for (var i = 0; i < clct.length; ++i) {
        var len = clct[i] & 31;
        wbits(out, p, llm[len]), p += lct[len];
        if (len > 15)
          wbits(out, p, clct[i] >> 5 & 127), p += clct[i] >> 12;
      }
    }
  } else {
    lm = flm, ll = flt, dm = fdm, dl = fdt;
  }
  for (var i = 0; i < li; ++i) {
    var sym = syms[i];
    if (sym > 255) {
      var len = sym >> 18 & 31;
      wbits16(out, p, lm[len + 257]), p += ll[len + 257];
      if (len > 7)
        wbits(out, p, sym >> 23 & 31), p += fleb[len];
      var dst = sym & 31;
      wbits16(out, p, dm[dst]), p += dl[dst];
      if (dst > 3)
        wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
    } else {
      wbits16(out, p, lm[sym]), p += ll[sym];
    }
  }
  wbits16(out, p, lm[256]);
  return p + ll[256];
};
var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
var et = /* @__PURE__ */ new u8(0);
var dflt = function(dat, lvl, plvl, pre, post, st) {
  var s = st.z || dat.length;
  var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
  var w = o.subarray(pre, o.length - post);
  var lst = st.l;
  var pos = (st.r || 0) & 7;
  if (lvl) {
    if (pos)
      w[0] = st.r >> 3;
    var opt = deo[lvl - 1];
    var n = opt >> 13, c = opt & 8191;
    var msk_1 = (1 << plvl) - 1;
    var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
    var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
    var hsh = function(i2) {
      return (dat[i2] ^ dat[i2 + 1] << bs1_1 ^ dat[i2 + 2] << bs2_1) & msk_1;
    };
    var syms = new i32(25e3);
    var lf = new u16(288), df = new u16(32);
    var lc_1 = 0, eb = 0, i = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
    for (; i + 2 < s; ++i) {
      var hv = hsh(i);
      var imod = i & 32767, pimod = head[hv];
      prev[imod] = pimod;
      head[hv] = imod;
      if (wi <= i) {
        var rem = s - i;
        if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
          pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i - bs, pos);
          li = lc_1 = eb = 0, bs = i;
          for (var j = 0; j < 286; ++j)
            lf[j] = 0;
          for (var j = 0; j < 30; ++j)
            df[j] = 0;
        }
        var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
        if (rem > 2 && hv == hsh(i - dif)) {
          var maxn = Math.min(n, rem) - 1;
          var maxd = Math.min(32767, i);
          var ml = Math.min(258, rem);
          while (dif <= maxd && --ch_1 && imod != pimod) {
            if (dat[i + l] == dat[i + l - dif]) {
              var nl = 0;
              for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                ;
              if (nl > l) {
                l = nl, d = dif;
                if (nl > maxn)
                  break;
                var mmd = Math.min(dif, nl - 2);
                var md = 0;
                for (var j = 0; j < mmd; ++j) {
                  var ti = i - dif + j & 32767;
                  var pti = prev[ti];
                  var cd = ti - pti & 32767;
                  if (cd > md)
                    md = cd, pimod = ti;
                }
              }
            }
            imod = pimod, pimod = prev[imod];
            dif += imod - pimod & 32767;
          }
        }
        if (d) {
          syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
          var lin = revfl[l] & 31, din = revfd[d] & 31;
          eb += fleb[lin] + fdeb[din];
          ++lf[257 + lin];
          ++df[din];
          wi = i + l;
          ++lc_1;
        } else {
          syms[li++] = dat[i];
          ++lf[dat[i]];
        }
      }
    }
    for (i = Math.max(i, wi); i < s; ++i) {
      syms[li++] = dat[i];
      ++lf[dat[i]];
    }
    pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i - bs, pos);
    if (!lst) {
      st.r = pos & 7 | w[pos / 8 | 0] << 3;
      pos -= 7;
      st.h = head, st.p = prev, st.i = i, st.w = wi;
    }
  } else {
    for (var i = st.w || 0; i < s + lst; i += 65535) {
      var e = i + 65535;
      if (e >= s) {
        w[pos / 8 | 0] = lst;
        e = s;
      }
      pos = wfblk(w, pos + 1, dat.subarray(i, e));
    }
    st.i = s;
  }
  return slc(o, 0, pre + shft(pos) + post);
};
var dopt = function(dat, opt, pre, post, st) {
  if (!st) {
    st = { l: 1 };
    if (opt.dictionary) {
      var dict = opt.dictionary.subarray(-32768);
      var newDat = new u8(dict.length + dat.length);
      newDat.set(dict);
      newDat.set(dat, dict.length);
      dat = newDat;
      st.w = dict.length;
    }
  }
  return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
};
function deflateSync(data, opts) {
  return dopt(data, opts || {}, 0, 0);
}
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}

// node_modules/terraria-world-file/dist/index.mjs
var BinaryReader = class {
  constructor() {
    this.ignoreBounds = false;
  }
  get offset() {
    return this._offset;
  }
  set offset(offset) {
    if (this.ignoreBounds && offset > this.view.byteLength) this.view = new DataView(this.view.buffer.transfer(this.view.byteLength + 4 * 1024 * 1024));
    if (this.progressCallback && offset / this.view.byteLength * 100 > this.progress + 1 && this.progress != 100) this.progressCallback(++this.progress);
    this._offset = offset;
  }
  loadBuffer(buffer) {
    this.view = new DataView(buffer);
    this._offset = this.progress = 0;
    return this;
  }
  readInt8() {
    this.offset += 1;
    return this.view.getInt8(this.offset - 1);
  }
  readUInt8() {
    this.offset += 1;
    return this.view.getUint8(this.offset - 1);
  }
  readInt16() {
    this.offset += 2;
    return this.view.getInt16(this.offset - 2, true);
  }
  readUInt16() {
    this.offset += 2;
    return this.view.getUint16(this.offset - 2, true);
  }
  readInt32() {
    this.offset += 4;
    return this.view.getInt32(this.offset - 4, true);
  }
  readUInt32() {
    this.offset += 4;
    return this.view.getUint32(this.offset - 4, true);
  }
  readInt64() {
    this.offset += 8;
    return this.view.getBigInt64(this.offset - 8, true);
  }
  readUInt64() {
    this.offset += 8;
    return this.view.getBigUint64(this.offset - 8, true);
  }
  readFloat32() {
    this.offset += 4;
    return this.view.getFloat32(this.offset - 4, true);
  }
  readFloat64() {
    this.offset += 8;
    return this.view.getFloat64(this.offset - 8, true);
  }
  readBoolean() {
    return Boolean(this.readUInt8());
  }
  readBytes(length) {
    return new Uint8Array(Array.from({ length }, () => this.readUInt8()));
  }
  readString(length) {
    if (!length) {
      length = 0;
      let shift = 0, byte;
      do {
        byte = this.readUInt8();
        length |= (byte & 127) << shift;
        shift += 7;
      } while (byte & 128);
    }
    return new TextDecoder().decode(this.readBytes(length));
  }
  readArray(length, valueReader) {
    return Array.from({ length }, () => valueReader());
  }
  readArrayUntil(predicate, valueReader) {
    return Array.from(function* () {
      while (predicate()) yield valueReader();
    }());
  }
  readBits(length) {
    let bytes = [];
    for (let i = length; i > 0; i = i - 8) bytes.push(this.readUInt8());
    let bitValues = [];
    for (let i = 0, j = 0; i < length; i++, j++) {
      if (j == 8) j = 0;
      bitValues[i] = Boolean(bytes[~~(i / 8)] & 1 << j);
    }
    return bitValues;
  }
  getPosition() {
    return this.offset;
  }
  skipBytes(count) {
    this.offset += count;
  }
  jumpTo(offset) {
    this.offset = offset;
  }
  isFinished() {
    return this.offset >= this.view.byteLength;
  }
};
var FileFormatHeaderData = class {
};
var FileFormatHeaderIO = class {
  parse(reader) {
    const data = new FileFormatHeaderData();
    data.version = reader.readInt32();
    data.magicNumber = reader.readString(7);
    data.fileType = reader.readUInt8();
    data.revision = reader.readUInt32();
    data.favorite = Boolean(reader.readInt64());
    data.pointers = reader.readArray(reader.readInt16(), () => reader.readInt32());
    data.importants = reader.readBits(reader.readUInt16());
    return data;
  }
  save(saver, data, world) {
    saver.saveInt32(data.version);
    saver.saveString("relogic", false);
    saver.saveUInt8(data.fileType);
    saver.saveUInt32(data.revision);
    saver.saveInt64(BigInt(data.favorite));
    saver.skipBytes(world.version >= 225 ? 46 : 42);
    saver.saveUInt16(data.importants.length);
    saver.saveBits(data.importants);
  }
};
var HeaderData = class {
};
var HeaderIO = class {
  parse(reader, world) {
    const isV140 = world.version >= 225;
    const isV144 = world.version >= 269;
    const data = new HeaderData();
    data.mapName = reader.readString();
    data.seedText = reader.readString();
    data.worldGeneratorVersion = reader.readBytes(8);
    data.guid = reader.readBytes(16);
    data.worldId = reader.readInt32();
    data.leftWorld = reader.readInt32();
    data.rightWorld = reader.readInt32();
    data.topWorld = reader.readInt32();
    data.bottomWorld = reader.readInt32();
    data.maxTilesY = reader.readInt32();
    data.maxTilesX = reader.readInt32();
    data.gameMode = Number(isV140 && reader.readInt32());
    data.drunkWorld = isV140 && reader.readBoolean();
    data.getGoodWorld = world.version >= 227 && reader.readBoolean();
    data.getTenthAnniversaryWorld = world.version >= 238 && reader.readBoolean();
    data.dontStarveWorld = world.version >= 239 && reader.readBoolean();
    data.notTheBeesWorld = world.version >= 241 && reader.readBoolean();
    data.remixWorld = world.version >= 249 && reader.readBoolean();
    data.noTrapsWorld = world.version >= 266 && reader.readBoolean();
    data.zenithWorld = world.version >= 267 && reader.readBoolean();
    data.skyblockWorld = world.version >= 302 && reader.readBoolean();
    data.expertMode = !isV140 && reader.readBoolean();
    data.creationTime = reader.readBytes(8);
    data.lastPlayed = world.version >= 284 ? reader.readBytes(8) : void 0;
    data.moonType = reader.readUInt8();
    data.treeX = [
      reader.readInt32(),
      reader.readInt32(),
      reader.readInt32()
    ];
    data.treeStyle = [
      reader.readInt32(),
      reader.readInt32(),
      reader.readInt32(),
      reader.readInt32()
    ];
    data.caveBackX = [
      reader.readInt32(),
      reader.readInt32(),
      reader.readInt32()
    ];
    data.caveBackStyle = [
      reader.readInt32(),
      reader.readInt32(),
      reader.readInt32(),
      reader.readInt32()
    ];
    data.iceBackStyle = reader.readInt32();
    data.jungleBackStyle = reader.readInt32();
    data.hellBackStyle = reader.readInt32();
    data.spawnTileX = reader.readInt32();
    data.spawnTileY = reader.readInt32();
    data.worldSurface = reader.readFloat64();
    data.rockLayer = reader.readFloat64();
    data.tempTime = reader.readFloat64();
    data.tempDayTime = reader.readBoolean();
    data.tempMoonPhase = reader.readInt32();
    data.tempBloodMoon = reader.readBoolean();
    data.tempEclipse = reader.readBoolean();
    data.dungeonX = reader.readInt32();
    data.dungeonY = reader.readInt32();
    data.crimson = reader.readBoolean();
    data.downedBoss1 = reader.readBoolean();
    data.downedBoss2 = reader.readBoolean();
    data.downedBoss3 = reader.readBoolean();
    data.downedQueenBee = reader.readBoolean();
    data.downedMechBoss1 = reader.readBoolean();
    data.downedMechBoss2 = reader.readBoolean();
    data.downedMechBoss3 = reader.readBoolean();
    data.downedMechBossAny = reader.readBoolean();
    data.downedPlantBoss = reader.readBoolean();
    data.downedGolemBoss = reader.readBoolean();
    data.downedSlimeKing = reader.readBoolean();
    data.savedGoblin = reader.readBoolean();
    data.savedWizard = reader.readBoolean();
    data.savedMech = reader.readBoolean();
    data.downedGoblins = reader.readBoolean();
    data.downedClown = reader.readBoolean();
    data.downedFrost = reader.readBoolean();
    data.downedPirates = reader.readBoolean();
    data.shadowOrbSmashed = reader.readBoolean();
    data.spawnMeteor = reader.readBoolean();
    data.shadowOrbCount = reader.readUInt8();
    data.altarCount = reader.readInt32();
    data.hardMode = reader.readBoolean();
    data.afterPartyOfDoom = world.version >= 257 && reader.readBoolean();
    data.invasionDelay = reader.readInt32();
    data.invasionSize = reader.readInt32();
    data.invasionType = reader.readInt32();
    data.invasionX = reader.readFloat64();
    data.slimeRainTime = reader.readFloat64();
    data.sundialCooldown = reader.readUInt8();
    data.tempRaining = reader.readBoolean();
    data.tempRainTime = reader.readInt32();
    data.tempMaxRain = reader.readFloat32();
    data.oreTier1 = reader.readInt32();
    data.oreTier2 = reader.readInt32();
    data.oreTier3 = reader.readInt32();
    data.setBG0 = reader.readUInt8();
    data.setBG1 = reader.readUInt8();
    data.setBG2 = reader.readUInt8();
    data.setBG3 = reader.readUInt8();
    data.setBG4 = reader.readUInt8();
    data.setBG5 = reader.readUInt8();
    data.setBG6 = reader.readUInt8();
    data.setBG7 = reader.readUInt8();
    data.cloudBGActive = reader.readInt32();
    data.numClouds = reader.readInt16();
    data.windSpeed = reader.readFloat32();
    data.anglerWhoFinishedToday = reader.readArray(reader.readInt32(), () => reader.readString());
    data.savedAngler = reader.readBoolean();
    data.anglerQuest = reader.readInt32();
    data.savedStylist = reader.readBoolean();
    data.savedTaxCollector = reader.readBoolean();
    data.savedGolfer = isV140 && reader.readBoolean();
    data.invasionSizeStart = reader.readInt32();
    data.tempCultistDelay = reader.readInt32();
    data.killCount = reader.readArray(reader.readInt16(), () => reader.readInt32());
    if (world.version >= 289) data.claimableBanners = reader.readArray(reader.readInt16(), () => reader.readUInt16());
    data.fastForwardTimeToDawn = reader.readBoolean();
    data.downedFishron = reader.readBoolean();
    data.downedMartians = reader.readBoolean();
    data.downedAncientCultist = reader.readBoolean();
    data.downedMoonlord = reader.readBoolean();
    data.downedHalloweenKing = reader.readBoolean();
    data.downedHalloweenTree = reader.readBoolean();
    data.downedChristmasIceQueen = reader.readBoolean();
    data.downedChristmasSantank = reader.readBoolean();
    data.downedChristmasTree = reader.readBoolean();
    data.downedTowerSolar = reader.readBoolean();
    data.downedTowerVortex = reader.readBoolean();
    data.downedTowerNebula = reader.readBoolean();
    data.downedTowerStardust = reader.readBoolean();
    data.TowerActiveSolar = reader.readBoolean();
    data.TowerActiveVortex = reader.readBoolean();
    data.TowerActiveNebula = reader.readBoolean();
    data.TowerActiveStardust = reader.readBoolean();
    data.LunarApocalypseIsUp = reader.readBoolean();
    data.tempPartyManual = reader.readBoolean();
    data.tempPartyGenuine = reader.readBoolean();
    data.tempPartyCooldown = reader.readInt32();
    data.tempPartyCelebratingNPCs = reader.readArray(reader.readInt32(), () => reader.readInt32());
    data.Temp_Sandstorm_Happening = reader.readBoolean();
    data.Temp_Sandstorm_TimeLeft = reader.readInt32();
    data.Temp_Sandstorm_Severity = reader.readFloat32();
    data.Temp_Sandstorm_IntendedSeverity = reader.readFloat32();
    data.savedBartender = reader.readBoolean();
    data.DD2Event_DownedInvasionT1 = reader.readBoolean();
    data.DD2Event_DownedInvasionT2 = reader.readBoolean();
    data.DD2Event_DownedInvasionT3 = reader.readBoolean();
    data.setBG8 = Number(isV140 && reader.readUInt8());
    data.setBG9 = Number(isV140 && reader.readUInt8());
    data.setBG10 = Number(isV140 && reader.readUInt8());
    data.setBG11 = Number(isV140 && reader.readUInt8());
    data.setBG12 = Number(isV140 && reader.readUInt8());
    data.combatBookWasUsed = isV140 && reader.readBoolean();
    data.lanternNightCooldown = Number(isV140 && reader.readInt32());
    data.lanternNightGenuine = isV140 && reader.readBoolean();
    data.lanternNightManual = isV140 && reader.readBoolean();
    data.lanternNightNextNightIsGenuine = isV140 && reader.readBoolean();
    data.treeTopsVariations = isV140 ? reader.readArray(reader.readInt32(), () => reader.readInt32()) : [];
    data.forceHalloweenForToday = isV140 && reader.readBoolean();
    data.forceXMasForToday = isV140 && reader.readBoolean();
    data.savedOreTierCopper = Number(isV140 && reader.readInt32());
    data.savedOreTierIron = Number(isV140 && reader.readInt32());
    data.savedOreTierSilver = Number(isV140 && reader.readInt32());
    data.savedOreTierGold = Number(isV140 && reader.readInt32());
    data.boughtCat = isV140 && reader.readBoolean();
    data.boughtDog = isV140 && reader.readBoolean();
    data.boughtBunny = isV140 && reader.readBoolean();
    data.downedEmpressOfLight = isV140 && reader.readBoolean();
    data.downedQueenSlime = isV140 && reader.readBoolean();
    data.downedDeerclops = world.version >= 240 && reader.readBoolean();
    data.unlockedSlimeBlueSpawn = isV144 && reader.readBoolean();
    data.unlockedMerchantSpawn = isV144 && reader.readBoolean();
    data.unlockedDemolitionistSpawn = isV144 && reader.readBoolean();
    data.unlockedPartyGirlSpawn = isV144 && reader.readBoolean();
    data.unlockedDyeTraderSpawn = isV144 && reader.readBoolean();
    data.unlockedTruffleSpawn = isV144 && reader.readBoolean();
    data.unlockedArmsDealerSpawn = isV144 && reader.readBoolean();
    data.unlockedNurseSpawn = isV144 && reader.readBoolean();
    data.unlockedPrincessSpawn = isV144 && reader.readBoolean();
    data.combatBookVolumeTwoWasUsed = isV144 && reader.readBoolean();
    data.peddlersSatchelWasUsed = isV144 && reader.readBoolean();
    data.unlockedSlimeGreenSpawn = isV144 && reader.readBoolean();
    data.unlockedSlimeOldSpawn = isV144 && reader.readBoolean();
    data.unlockedSlimePurpleSpawn = isV144 && reader.readBoolean();
    data.unlockedSlimeRainbowSpawn = isV144 && reader.readBoolean();
    data.unlockedSlimeRedSpawn = isV144 && reader.readBoolean();
    data.unlockedSlimeYellowSpawn = isV144 && reader.readBoolean();
    data.unlockedSlimeCopperSpawn = isV144 && reader.readBoolean();
    data.fastForwardTimeToDusk = isV144 && reader.readBoolean();
    data.moondialCooldown = Number(isV144 && reader.readUInt8());
    data.forceHalloweenForever = world.version >= 287 && reader.readBoolean();
    data.forceXMasForever = world.version >= 287 && reader.readBoolean();
    data.vampireSeed = world.version >= 288 && reader.readBoolean();
    data.infectedSeed = world.version >= 296 && reader.readBoolean();
    data.tempMeteorShowerCount = Number(world.version >= 291 && reader.readInt32());
    data.tempCoinRain = Number(world.version >= 291 && reader.readInt32());
    data.teamBasedSpawnsSeed = world.version >= 297 && reader.readBoolean();
    data.extraSpawnPoints = world.version >= 297 ? reader.readArray(reader.readInt8(), () => ({
      x: reader.readInt16(),
      y: reader.readInt16()
    })) : [];
    data.dualDungeonsSeed = world.version >= 304 && reader.readBoolean();
    data.manifest = world.version >= 299 ? reader.readString() : "";
    return data;
  }
  save(saver, data, world) {
    saver.saveString(data.mapName);
    saver.saveString(data.seedText);
    saver.saveBytes(data.worldGeneratorVersion);
    saver.saveBytes(data.guid);
    saver.saveInt32(data.worldId);
    saver.saveInt32(data.leftWorld);
    saver.saveInt32(data.rightWorld);
    saver.saveInt32(data.topWorld);
    saver.saveInt32(data.bottomWorld);
    saver.saveInt32(data.maxTilesY);
    saver.saveInt32(data.maxTilesX);
    if (world.version >= 225) {
      saver.saveInt32(data.gameMode);
      saver.saveBoolean(data.drunkWorld);
      if (world.version >= 227) saver.saveBoolean(data.getGoodWorld);
      if (world.version >= 238) saver.saveBoolean(data.getTenthAnniversaryWorld);
      if (world.version >= 239) saver.saveBoolean(data.dontStarveWorld);
      if (world.version >= 241) saver.saveBoolean(data.notTheBeesWorld);
      if (world.version >= 249) saver.saveBoolean(data.remixWorld);
      if (world.version >= 266) saver.saveBoolean(data.noTrapsWorld);
      if (world.version >= 267) saver.saveBoolean(data.zenithWorld);
    } else saver.saveBoolean(data.expertMode);
    saver.saveBytes(data.creationTime);
    saver.saveUInt8(data.moonType);
    saver.saveInt32(data.treeX[0]);
    saver.saveInt32(data.treeX[1]);
    saver.saveInt32(data.treeX[2]);
    saver.saveInt32(data.treeStyle[0]);
    saver.saveInt32(data.treeStyle[1]);
    saver.saveInt32(data.treeStyle[2]);
    saver.saveInt32(data.treeStyle[3]);
    saver.saveInt32(data.caveBackX[0]);
    saver.saveInt32(data.caveBackX[1]);
    saver.saveInt32(data.caveBackX[2]);
    saver.saveInt32(data.caveBackStyle[0]);
    saver.saveInt32(data.caveBackStyle[1]);
    saver.saveInt32(data.caveBackStyle[2]);
    saver.saveInt32(data.caveBackStyle[3]);
    saver.saveInt32(data.iceBackStyle);
    saver.saveInt32(data.jungleBackStyle);
    saver.saveInt32(data.hellBackStyle);
    saver.saveInt32(data.spawnTileX);
    saver.saveInt32(data.spawnTileY);
    saver.saveFloat64(data.worldSurface);
    saver.saveFloat64(data.rockLayer);
    saver.saveFloat64(data.tempTime);
    saver.saveBoolean(data.tempDayTime);
    saver.saveInt32(data.tempMoonPhase);
    saver.saveBoolean(data.tempBloodMoon);
    saver.saveBoolean(data.tempEclipse);
    saver.saveInt32(data.dungeonX);
    saver.saveInt32(data.dungeonY);
    saver.saveBoolean(data.crimson);
    saver.saveBoolean(data.downedBoss1);
    saver.saveBoolean(data.downedBoss2);
    saver.saveBoolean(data.downedBoss3);
    saver.saveBoolean(data.downedQueenBee);
    saver.saveBoolean(data.downedMechBoss1);
    saver.saveBoolean(data.downedMechBoss2);
    saver.saveBoolean(data.downedMechBoss3);
    saver.saveBoolean(data.downedMechBossAny);
    saver.saveBoolean(data.downedPlantBoss);
    saver.saveBoolean(data.downedGolemBoss);
    saver.saveBoolean(data.downedSlimeKing);
    saver.saveBoolean(data.savedGoblin);
    saver.saveBoolean(data.savedWizard);
    saver.saveBoolean(data.savedMech);
    saver.saveBoolean(data.downedGoblins);
    saver.saveBoolean(data.downedClown);
    saver.saveBoolean(data.downedFrost);
    saver.saveBoolean(data.downedPirates);
    saver.saveBoolean(data.shadowOrbSmashed);
    saver.saveBoolean(data.spawnMeteor);
    saver.saveUInt8(data.shadowOrbCount);
    saver.saveInt32(data.altarCount);
    saver.saveBoolean(data.hardMode);
    if (world.version >= 257) saver.saveBoolean(data.afterPartyOfDoom);
    saver.saveInt32(data.invasionDelay);
    saver.saveInt32(data.invasionSize);
    saver.saveInt32(data.invasionType);
    saver.saveFloat64(data.invasionX);
    saver.saveFloat64(data.slimeRainTime);
    saver.saveUInt8(data.sundialCooldown);
    saver.saveBoolean(data.tempRaining);
    saver.saveInt32(data.tempRainTime);
    saver.saveFloat32(data.tempMaxRain);
    saver.saveInt32(data.oreTier1);
    saver.saveInt32(data.oreTier2);
    saver.saveInt32(data.oreTier3);
    saver.saveUInt8(data.setBG0);
    saver.saveUInt8(data.setBG1);
    saver.saveUInt8(data.setBG2);
    saver.saveUInt8(data.setBG3);
    saver.saveUInt8(data.setBG4);
    saver.saveUInt8(data.setBG5);
    saver.saveUInt8(data.setBG6);
    saver.saveUInt8(data.setBG7);
    saver.saveInt32(data.cloudBGActive);
    saver.saveInt16(data.numClouds);
    saver.saveFloat32(data.windSpeed);
    saver.saveInt32(data.anglerWhoFinishedToday.length);
    data.anglerWhoFinishedToday.forEach((e) => saver.saveString(e));
    saver.saveBoolean(data.savedAngler);
    saver.saveInt32(data.anglerQuest);
    saver.saveBoolean(data.savedStylist);
    saver.saveBoolean(data.savedTaxCollector);
    if (world.version >= 225) saver.saveBoolean(data.savedGolfer);
    saver.saveInt32(data.invasionSizeStart);
    saver.saveInt32(data.tempCultistDelay);
    saver.saveInt16(data.killCount.length);
    data.killCount.forEach((e) => saver.saveInt32(e));
    saver.saveBoolean(data.fastForwardTimeToDawn);
    saver.saveBoolean(data.downedFishron);
    saver.saveBoolean(data.downedMartians);
    saver.saveBoolean(data.downedAncientCultist);
    saver.saveBoolean(data.downedMoonlord);
    saver.saveBoolean(data.downedHalloweenKing);
    saver.saveBoolean(data.downedHalloweenTree);
    saver.saveBoolean(data.downedChristmasIceQueen);
    saver.saveBoolean(data.downedChristmasSantank);
    saver.saveBoolean(data.downedChristmasTree);
    saver.saveBoolean(data.downedTowerSolar);
    saver.saveBoolean(data.downedTowerVortex);
    saver.saveBoolean(data.downedTowerNebula);
    saver.saveBoolean(data.downedTowerStardust);
    saver.saveBoolean(data.TowerActiveSolar);
    saver.saveBoolean(data.TowerActiveVortex);
    saver.saveBoolean(data.TowerActiveNebula);
    saver.saveBoolean(data.TowerActiveStardust);
    saver.saveBoolean(data.LunarApocalypseIsUp);
    saver.saveBoolean(data.tempPartyManual);
    saver.saveBoolean(data.tempPartyGenuine);
    saver.saveInt32(data.tempPartyCooldown);
    saver.saveInt32(data.tempPartyCelebratingNPCs.length);
    data.tempPartyCelebratingNPCs.forEach((e) => saver.saveInt32(e));
    saver.saveBoolean(data.Temp_Sandstorm_Happening);
    saver.saveInt32(data.Temp_Sandstorm_TimeLeft);
    saver.saveFloat32(data.Temp_Sandstorm_Severity);
    saver.saveFloat32(data.Temp_Sandstorm_IntendedSeverity);
    saver.saveBoolean(data.savedBartender);
    saver.saveBoolean(data.DD2Event_DownedInvasionT1);
    saver.saveBoolean(data.DD2Event_DownedInvasionT2);
    saver.saveBoolean(data.DD2Event_DownedInvasionT3);
    if (world.version >= 225) {
      saver.saveUInt8(data.setBG8);
      saver.saveUInt8(data.setBG9);
      saver.saveUInt8(data.setBG10);
      saver.saveUInt8(data.setBG11);
      saver.saveUInt8(data.setBG12);
      saver.saveBoolean(data.combatBookWasUsed);
      saver.saveInt32(data.lanternNightCooldown);
      saver.saveBoolean(data.lanternNightGenuine);
      saver.saveBoolean(data.lanternNightManual);
      saver.saveBoolean(data.lanternNightNextNightIsGenuine);
      saver.saveInt32(data.treeTopsVariations.length);
      data.treeTopsVariations.forEach((e) => saver.saveInt32(e));
      saver.saveBoolean(data.forceHalloweenForToday);
      saver.saveBoolean(data.forceXMasForToday);
      saver.saveInt32(data.savedOreTierCopper);
      saver.saveInt32(data.savedOreTierIron);
      saver.saveInt32(data.savedOreTierSilver);
      saver.saveInt32(data.savedOreTierGold);
      saver.saveBoolean(data.boughtCat);
      saver.saveBoolean(data.boughtDog);
      saver.saveBoolean(data.boughtBunny);
      saver.saveBoolean(data.downedEmpressOfLight);
      saver.saveBoolean(data.downedQueenSlime);
    }
    if (world.version >= 240) saver.saveBoolean(data.downedDeerclops);
    if (world.version >= 269) {
      saver.saveBoolean(data.unlockedSlimeBlueSpawn);
      saver.saveBoolean(data.unlockedMerchantSpawn);
      saver.saveBoolean(data.unlockedDemolitionistSpawn);
      saver.saveBoolean(data.unlockedPartyGirlSpawn);
      saver.saveBoolean(data.unlockedDyeTraderSpawn);
      saver.saveBoolean(data.unlockedTruffleSpawn);
      saver.saveBoolean(data.unlockedArmsDealerSpawn);
      saver.saveBoolean(data.unlockedNurseSpawn);
      saver.saveBoolean(data.unlockedPrincessSpawn);
      saver.saveBoolean(data.combatBookVolumeTwoWasUsed);
      saver.saveBoolean(data.peddlersSatchelWasUsed);
      saver.saveBoolean(data.unlockedSlimeGreenSpawn);
      saver.saveBoolean(data.unlockedSlimeOldSpawn);
      saver.saveBoolean(data.unlockedSlimePurpleSpawn);
      saver.saveBoolean(data.unlockedSlimeRainbowSpawn);
      saver.saveBoolean(data.unlockedSlimeRedSpawn);
      saver.saveBoolean(data.unlockedSlimeYellowSpawn);
      saver.saveBoolean(data.unlockedSlimeCopperSpawn);
      saver.saveBoolean(data.fastForwardTimeToDusk);
      saver.saveUInt8(data.moondialCooldown);
    }
  }
};
var Liquid = /* @__PURE__ */ function(Liquid$1) {
  Liquid$1[Liquid$1["Water"] = 1] = "Water";
  Liquid$1[Liquid$1["Lava"] = 2] = "Lava";
  Liquid$1[Liquid$1["Honey"] = 3] = "Honey";
  Liquid$1[Liquid$1["Shimmer"] = 4] = "Shimmer";
  return Liquid$1;
}({});
var TileEntityType = /* @__PURE__ */ function(TileEntityType$1) {
  TileEntityType$1[TileEntityType$1["TrainingDummy"] = 0] = "TrainingDummy";
  TileEntityType$1[TileEntityType$1["ItemFrame"] = 1] = "ItemFrame";
  TileEntityType$1[TileEntityType$1["LogicSensor"] = 2] = "LogicSensor";
  TileEntityType$1[TileEntityType$1["DisplayDoll"] = 3] = "DisplayDoll";
  TileEntityType$1[TileEntityType$1["WeaponsRack"] = 4] = "WeaponsRack";
  TileEntityType$1[TileEntityType$1["HatRack"] = 5] = "HatRack";
  TileEntityType$1[TileEntityType$1["FoodPlatter"] = 6] = "FoodPlatter";
  TileEntityType$1[TileEntityType$1["Pylon"] = 7] = "Pylon";
  return TileEntityType$1;
}({});
var CreativePowerType = /* @__PURE__ */ function(CreativePowerType$1) {
  CreativePowerType$1[CreativePowerType$1["FreezeTime"] = 0] = "FreezeTime";
  CreativePowerType$1[CreativePowerType$1["ModifyTimeRate"] = 8] = "ModifyTimeRate";
  CreativePowerType$1[CreativePowerType$1["FreezeRainPower"] = 9] = "FreezeRainPower";
  CreativePowerType$1[CreativePowerType$1["FreezeWindDirectionAndStrength"] = 10] = "FreezeWindDirectionAndStrength";
  CreativePowerType$1[CreativePowerType$1["DifficultySliderPower"] = 12] = "DifficultySliderPower";
  CreativePowerType$1[CreativePowerType$1["StopBiomeSpreadPower"] = 13] = "StopBiomeSpreadPower";
  return CreativePowerType$1;
}({});
var WorldTilesData = class {
};
var WorldTilesIO = class {
  parse(reader, world) {
    const data = new WorldTilesData();
    this.RLE = 0;
    data.tiles = new Array(world.width);
    for (let x = 0; x < world.width; x++) {
      data.tiles[x] = new Array(world.height);
      for (let y = 0; y < world.height; y++) {
        data.tiles[x][y] = this.parseTileData(reader, world);
        while (this.RLE) {
          data.tiles[x][y + 1] = data.tiles[x][y];
          y++;
          this.RLE--;
        }
      }
    }
    return data;
  }
  save(saver, data, world) {
    const worldTilesCount = world.width * world.height;
    for (let x = 0; x < world.width; x++) for (let y = 0; y < world.height; ) {
      const tile = data.tiles[x][y];
      this.RLE = 0;
      while (JSON.stringify(tile) === JSON.stringify(data.tiles[x][++y]) && y < world.height) {
        if (world.version >= 232 && (tile.blockId == 520 || tile.blockId == 423)) break;
        this.RLE++;
      }
      this.saveTileData(saver, world, tile);
      if (saver.progressCallback && (x * world.height + y) / worldTilesCount * 100 > saver.progress + 1 && saver.progress != 100) saver.progressCallback(++saver.progress);
    }
  }
  parseTileData(reader, world) {
    let tile = {};
    const flags1 = reader.readUInt8();
    let flags2 = 0, flags3 = 0, flags4 = 0;
    if (flags1 & 1) {
      flags2 = reader.readUInt8();
      if (flags2 & 1) {
        flags3 = reader.readUInt8();
        if (flags3 & 1) flags4 = reader.readUInt8();
      }
    }
    if (flags1 & 62) {
      if (flags1 & 2) {
        if (flags1 & 32) tile.blockId = reader.readUInt16();
        else tile.blockId = reader.readUInt8();
        if (world.importants[tile.blockId]) {
          tile.frameX = reader.readInt16();
          tile.frameY = reader.readInt16();
          if (tile.blockId == 144) tile.frameY = 0;
        }
        if (flags3 & 8) tile.blockColor = reader.readUInt8();
      }
      if (flags1 & 4) {
        tile.wallId = reader.readUInt8();
        if (flags3 & 16) tile.wallColor = reader.readUInt8();
      }
      const liquidType = (flags1 & 24) >> 3;
      if (liquidType) {
        tile.liquidAmount = reader.readUInt8();
        if (flags3 & 128) tile.liquidType = Liquid.Shimmer;
        else tile.liquidType = liquidType;
      }
    }
    if (flags2) {
      if (flags2 & 126) {
        if (flags2 & 2) tile.wireRed = true;
        if (flags2 & 4) tile.wireBlue = true;
        if (flags2 & 8) tile.wireGreen = true;
        const slope = (flags2 & 112) >> 4;
        if (slope) tile.slope = slope;
      }
      if (flags3) {
        if (flags3 & 126) {
          if (flags3 & 2) tile.actuator = true;
          if (flags3 & 4) tile.actuated = true;
          if (flags3 & 32) tile.wireYellow = true;
          if (flags3 & 64) {
            reader.skipBytes(1);
            tile.wallId = 256 + tile.wallId;
          }
        }
        if (flags4) {
          if (flags4 & 2) tile.invisibleBlock = true;
          if (flags4 & 4) tile.invisibleWall = true;
          if (flags4 & 8) tile.fullBrightBlock = true;
          if (flags4 & 16) tile.fullBrightWall = true;
        }
      }
    }
    switch (flags1 & 192) {
      case 64:
        this.RLE = reader.readUInt8();
        break;
      case 128:
        this.RLE = reader.readInt16();
        break;
    }
    return tile;
  }
  saveTileData(saver, world, tile) {
    let flags1 = 0, flags2 = 0, flags3 = 0, flags4 = 0;
    if (this.RLE) flags1 |= this.RLE > 255 ? 128 : 64;
    if (tile.blockId >= 0) {
      flags1 |= 2;
      if (tile.blockId > 255) flags1 |= 32;
    }
    if (tile.wallId) {
      flags1 |= 4;
      if (tile.wallId > 255) flags3 |= 64;
    }
    if (tile.liquidAmount) if (tile.liquidType == 4) {
      flags1 |= 8;
      flags3 |= 128;
    } else flags1 |= tile.liquidType << 3;
    if (tile.slope) flags2 |= tile.slope << 4;
    flags2 |= tile.wireRed ? 2 : 0;
    flags2 |= tile.wireBlue ? 4 : 0;
    flags2 |= tile.wireGreen ? 8 : 0;
    flags3 |= tile.wireYellow ? 32 : 0;
    flags3 |= tile.actuator ? 2 : 0;
    flags3 |= tile.actuated ? 4 : 0;
    flags3 |= tile.blockColor ? 8 : 0;
    flags3 |= tile.wallColor ? 16 : 0;
    flags4 |= tile.invisibleBlock ? 2 : 0;
    flags4 |= tile.invisibleWall ? 4 : 0;
    flags4 |= tile.fullBrightBlock ? 8 : 0;
    flags4 |= tile.fullBrightWall ? 16 : 0;
    if (flags4) {
      saver.saveUInt8(flags1 | 1);
      saver.saveUInt8(flags2 | 1);
      saver.saveUInt8(flags3 | 1);
      saver.saveUInt8(flags4);
    } else if (flags3) {
      saver.saveUInt8(flags1 | 1);
      saver.saveUInt8(flags2 | 1);
      saver.saveUInt8(flags3);
    } else if (flags2) {
      saver.saveUInt8(flags1 | 1);
      saver.saveUInt8(flags2);
    } else saver.saveUInt8(flags1);
    if (flags1 & 2) {
      if (flags1 & 32) saver.saveUInt16(tile.blockId);
      else saver.saveUInt8(tile.blockId);
      if (world.importants[tile.blockId]) {
        saver.saveInt16(tile.frameX);
        saver.saveInt16(tile.frameY);
      }
      if (flags3 & 8) saver.saveUInt8(tile.blockColor);
    }
    if (flags1 & 4) {
      saver.saveUInt8(tile.wallId);
      if (flags3 & 16) saver.saveUInt8(tile.wallColor);
    }
    if (tile.liquidAmount) saver.saveUInt8(tile.liquidAmount);
    if (flags3 & 64) saver.saveUInt8(1);
    if (this.RLE > 255) saver.saveUInt16(this.RLE);
    else if (this.RLE) saver.saveUInt8(this.RLE);
  }
};
var SignsData = class {
};
var SignsIO = class {
  parse(reader) {
    const data = new SignsData();
    data.signs = reader.readArray(reader.readInt16(), () => this.parseSign(reader));
    return data;
  }
  parseSign(reader) {
    return {
      text: reader.readString(),
      position: {
        x: reader.readInt32(),
        y: reader.readInt32()
      }
    };
  }
  save(saver, data, world) {
    saver.saveInt16(data.signs.length);
    data.signs.forEach((sign) => {
      saver.saveString(sign.text);
      saver.saveInt32(sign.position.x);
      saver.saveInt32(sign.position.y);
    });
  }
};
var ChestsData = class {
};
var ChestsIO = class {
  parse(reader, world) {
    const data = new ChestsData();
    data.chests = reader.readArray(world.version < 294 ? reader.readInt32() & 65535 : reader.readInt16(), () => this.parseChest(reader, world));
    return data;
  }
  parseChest(reader, world) {
    const data = {
      position: {
        x: reader.readInt32(),
        y: reader.readInt32()
      },
      name: reader.readString()
    };
    let chestSize = 40;
    if (world.version >= 294) chestSize = reader.readInt32();
    data.items = reader.readArray(chestSize, () => this.parseItem(reader)).map((item) => item.stack ? item : null);
    if (!data.name) delete data.name;
    if (!data.items) delete data.items;
    return data;
  }
  parseItem(reader) {
    const stack = reader.readInt16();
    return {
      stack,
      id: Number(stack && reader.readInt32()),
      prefix: Number(stack && reader.readUInt8())
    };
  }
  save(saver, data, world) {
    saver.saveInt16(data.chests.length);
    saver.saveInt16(40);
    data.chests.forEach((chest) => {
      saver.saveInt32(chest.position.x);
      saver.saveInt32(chest.position.y);
      if (chest.name) saver.saveString(chest.name);
      else saver.saveUInt8(0);
      chest.items?.forEach((item) => {
        if (item == null) saver.saveInt16(0);
        else {
          saver.saveInt16(item.stack);
          saver.saveInt32(item.id);
          saver.saveUInt8(item.prefix);
        }
      });
    });
  }
};
var NPCsData = class {
};
var NPCsIO = class {
  parse(reader, world) {
    const data = new NPCsData();
    const shimmeredNPCIds = world.version > 268 ? reader.readArray(reader.readInt32(), () => reader.readInt32()) : [];
    data.townNPCs = reader.readArrayUntil(() => reader.readBoolean(), () => this.parseNPC(reader, world, shimmeredNPCIds));
    data.pillars = reader.readArrayUntil(() => reader.readBoolean(), () => this.parsePillar(reader));
    return data;
  }
  parseNPC(reader, world, shimmeredNPCIds) {
    const NPC = {
      id: reader.readInt32(),
      name: reader.readString(),
      position: {
        x: reader.readFloat32(),
        y: reader.readFloat32()
      },
      homeless: reader.readBoolean(),
      homePosition: {
        x: reader.readInt32(),
        y: reader.readInt32()
      }
    };
    if (world.version >= 225 && reader.readBits(1)[0]) NPC.variationIndex = reader.readInt32();
    if (world.version >= 315) NPC.homelessDespawn = reader.readBoolean();
    if (shimmeredNPCIds.includes(NPC.id)) NPC.shimmered = true;
    return NPC;
  }
  parsePillar(reader) {
    return {
      id: reader.readInt32(),
      position: {
        x: reader.readFloat32(),
        y: reader.readFloat32()
      }
    };
  }
  save(saver, data, world) {
    saver.saveArray(data.townNPCs.filter((NPC) => NPC.shimmered), (length) => saver.saveInt32(length), (e) => saver.saveInt32(e.id));
    data.townNPCs.forEach((NPC) => {
      saver.saveBoolean(true);
      saver.saveInt32(NPC.id);
      saver.saveString(NPC.name);
      saver.saveFloat32(NPC.position.x);
      saver.saveFloat32(NPC.position.y);
      saver.saveBoolean(NPC.homeless);
      saver.saveInt32(NPC.homePosition.x);
      saver.saveInt32(NPC.homePosition.y);
      if (world.version >= 225) if (NPC.variationIndex !== void 0) {
        saver.saveUInt8(1);
        saver.saveInt32(NPC.variationIndex);
      } else saver.saveUInt8(1);
    });
    saver.saveBoolean(false);
    data.pillars.forEach((NPC) => {
      saver.saveBoolean(true);
      saver.saveInt32(NPC.id);
      saver.saveFloat32(NPC.position.x);
      saver.saveFloat32(NPC.position.y);
    });
    saver.saveBoolean(false);
  }
};
var FooterData = class {
};
var FooterIO = class {
  parse(reader, world) {
    const data = new FooterData();
    data.signoff1 = reader.readBoolean();
    data.signoff2 = reader.readString();
    data.signoff3 = reader.readInt32();
    return data;
  }
  save(saver, data, world) {
    saver.saveBoolean(true);
    saver.saveString(world.mapName);
    saver.saveInt32(world.worldId);
  }
};
var CreativePowersData = class {
};
var CreativePowersIO = class {
  parse(reader) {
    const data = new CreativePowersData();
    const powers = reader.readArrayUntil(() => reader.readBoolean(), () => this.parseCreativePower(reader));
    for (const [powerType, value] of powers) {
      const powerName = CreativePowerType[powerType], powerNameUncapitalized = powerName.charAt(0).toLowerCase() + powerName.slice(1);
      data[powerNameUncapitalized] = value;
    }
    return data;
  }
  parseCreativePower(reader) {
    const type = reader.readUInt16();
    switch (type) {
      case CreativePowerType.FreezeTime:
        return [type, reader.readBoolean()];
      case CreativePowerType.ModifyTimeRate:
        return [type, reader.readFloat32()];
      case CreativePowerType.FreezeRainPower:
        return [type, reader.readBoolean()];
      case CreativePowerType.FreezeWindDirectionAndStrength:
        return [type, reader.readBoolean()];
      case CreativePowerType.DifficultySliderPower:
        return [type, reader.readFloat32()];
      case CreativePowerType.StopBiomeSpreadPower:
        return [type, reader.readBoolean()];
      default:
        return [type, 0];
    }
  }
  save(saver, data, world) {
    saver.saveBoolean(true);
    saver.saveInt16(CreativePowerType.FreezeTime);
    saver.saveBoolean(data.freezeTime);
    saver.saveBoolean(true);
    saver.saveInt16(CreativePowerType.ModifyTimeRate);
    saver.saveFloat32(data.modifyTimeRate);
    saver.saveBoolean(true);
    saver.saveInt16(CreativePowerType.FreezeRainPower);
    saver.saveBoolean(data.freezeRainPower);
    saver.saveBoolean(true);
    saver.saveInt16(CreativePowerType.FreezeWindDirectionAndStrength);
    saver.saveBoolean(data.freezeWindDirectionAndStrength);
    saver.saveBoolean(true);
    saver.saveInt16(CreativePowerType.DifficultySliderPower);
    saver.saveFloat32(data.difficultySliderPower);
    saver.saveBoolean(true);
    saver.saveInt16(CreativePowerType.StopBiomeSpreadPower);
    saver.saveBoolean(data.stopBiomeSpreadPower);
    saver.saveBoolean(false);
  }
};
var BestiaryData = class {
};
var BestiaryIO = class {
  parse(reader, world) {
    const data = new BestiaryData();
    data.NPCKills = Object.fromEntries(reader.readArray(reader.readInt32(), () => [reader.readString(), reader.readInt32()]));
    data.NPCSights = reader.readArray(reader.readInt32(), () => reader.readString());
    data.NPCChats = reader.readArray(reader.readInt32(), () => reader.readString());
    return data;
  }
  save(saver, data, world) {
    saver.saveArray(Object.entries(data.NPCKills), (length) => saver.saveInt32(length), ([name, count]) => {
      saver.saveString(name);
      saver.saveInt32(count);
    });
    saver.saveArray(data.NPCSights, (length) => saver.saveInt32(length), (e) => saver.saveString(e));
    saver.saveArray(data.NPCChats, (length) => saver.saveInt32(length), (e) => saver.saveString(e));
  }
};
var TownManagerData = class {
};
var TownManagerIO = class {
  parse(reader, world) {
    const data = new TownManagerData();
    data.rooms = reader.readArray(reader.readInt32(), () => this.parseTownRoom(reader));
    return data;
  }
  parseTownRoom(reader) {
    return {
      NPCId: reader.readInt32(),
      position: {
        x: reader.readInt32(),
        y: reader.readInt32()
      }
    };
  }
  save(saver, data, world) {
    saver.saveArray(data.rooms, (length) => saver.saveInt32(length), (room) => {
      saver.saveInt32(room.NPCId);
      saver.saveInt32(room.position.x);
      saver.saveInt32(room.position.y);
    });
  }
};
var WeightedPressurePlatesData = class {
};
var WeightedPressurePlatesIO = class {
  parse(reader, world) {
    const data = new WeightedPressurePlatesData();
    data.weightedPressurePlates = reader.readArray(reader.readInt32(), () => this.parseWeightedPressurePlate(reader));
    return data;
  }
  parseWeightedPressurePlate(reader) {
    return { position: {
      x: reader.readInt32(),
      y: reader.readInt32()
    } };
  }
  save(saver, data, world) {
    saver.saveArray(data.weightedPressurePlates, (length) => saver.saveInt32(length), (pressurePlate) => {
      saver.saveInt32(pressurePlate.position.x);
      saver.saveInt32(pressurePlate.position.y);
    });
  }
};
var TileEntitiesData = class {
};
var TileEntitiesIO = class {
  parse(reader, world) {
    const data = new TileEntitiesData();
    data.entities = reader.readArray(reader.readInt32(), () => this.parseEntity(reader, world));
    return data;
  }
  parseEntity(reader, world) {
    const entity = {
      type: reader.readUInt8(),
      id: reader.readInt32(),
      position: {
        x: reader.readInt16(),
        y: reader.readInt16()
      }
    };
    switch (entity.type) {
      case TileEntityType.TrainingDummy:
        return this.parseTrainingDummy(reader, entity);
      case TileEntityType.ItemFrame:
        return this.parseItemFrame(reader, entity);
      case TileEntityType.LogicSensor:
        return this.parseLogicSensor(reader, entity);
      case TileEntityType.DisplayDoll:
        return this.parseDisplayDoll(reader, entity, world);
      case TileEntityType.WeaponsRack:
        return this.parseWeaponsRack(reader, entity);
      case TileEntityType.HatRack:
        return this.parseHatRack(reader, entity);
      case TileEntityType.FoodPlatter:
        return this.parseFoodPlatter(reader, entity);
      case TileEntityType.Pylon:
        return entity;
    }
  }
  parseTrainingDummy(reader, entity) {
    return {
      ...entity,
      type: TileEntityType.TrainingDummy,
      npc: reader.readInt16()
    };
  }
  parseItemFrame(reader, entity) {
    return {
      ...entity,
      type: TileEntityType.ItemFrame,
      item: this.parseItem(reader)
    };
  }
  parseLogicSensor(reader, entity) {
    return {
      ...entity,
      type: TileEntityType.LogicSensor,
      logicCheck: reader.readUInt8(),
      on: reader.readBoolean()
    };
  }
  parseDisplayDoll(reader, entity, world) {
    const items = reader.readBits(8), dyes = reader.readBits(8);
    if (world.version >= 307) reader.readInt8();
    if (world.version >= 308) reader.readInt8();
    return {
      ...entity,
      type: TileEntityType.DisplayDoll,
      items: items.map((bit) => bit ? this.parseItem(reader) : null),
      dyes: dyes.map((bit) => bit ? this.parseItem(reader) : null)
    };
  }
  parseWeaponsRack(reader, entity) {
    return {
      ...entity,
      type: TileEntityType.WeaponsRack,
      item: this.parseItem(reader)
    };
  }
  parseHatRack(reader, entity) {
    const items = reader.readBits(8), dyes = reader.readBits(8);
    return {
      ...entity,
      type: TileEntityType.HatRack,
      items: items.map((bit) => bit ? this.parseItem(reader) : null),
      dyes: dyes.map((bit) => bit ? this.parseItem(reader) : null)
    };
  }
  parseFoodPlatter(reader, entity) {
    return {
      ...entity,
      type: TileEntityType.FoodPlatter,
      item: this.parseItem(reader)
    };
  }
  parseItem(reader) {
    return {
      id: reader.readInt16(),
      prefix: reader.readUInt8(),
      stack: reader.readInt16()
    };
  }
  save(saver, data, world) {
    saver.saveArray(data.entities, (length) => saver.saveInt32(length), (entity) => this.saveTileEntity(saver, entity));
  }
  saveTileEntity(saver, entity) {
    saver.saveUInt8(entity.type);
    saver.saveInt32(entity.id);
    saver.saveInt16(entity.position.x);
    saver.saveInt16(entity.position.y);
    switch (entity.type) {
      case TileEntityType.TrainingDummy:
        saver.saveInt16(entity.npc);
        break;
      case TileEntityType.ItemFrame:
      case TileEntityType.WeaponsRack:
      case TileEntityType.FoodPlatter:
        this.saveItem(saver, entity.item);
        break;
      case TileEntityType.LogicSensor:
        saver.saveUInt8(entity.logicCheck);
        saver.saveBoolean(entity.on);
        break;
      case TileEntityType.DisplayDoll:
      case TileEntityType.HatRack:
        saver.saveBits(entity.items.map((itemSlot) => itemSlot !== null));
        saver.saveBits(entity.dyes.map((itemSlot) => itemSlot !== null));
        saver.saveArray(entity.items, null, (itemSlot) => this.saveItem(saver, itemSlot));
        saver.saveArray(entity.dyes, null, (itemSlot) => this.saveItem(saver, itemSlot));
        break;
    }
  }
  saveItem(saver, item) {
    if (item !== null) {
      saver.saveInt16(item.id);
      saver.saveUInt8(item.prefix);
      saver.saveInt16(item.stack);
    }
  }
};
var sections = {
  fileFormatHeader: new FileFormatHeaderIO(),
  header: new HeaderIO(),
  worldTiles: new WorldTilesIO(),
  chests: new ChestsIO(),
  signs: new SignsIO(),
  NPCs: new NPCsIO(),
  tileEntities: new TileEntitiesIO(),
  weightedPressurePlates: new WeightedPressurePlatesIO(),
  townManager: new TownManagerIO(),
  bestiary: new BestiaryIO(),
  creativePowers: new CreativePowersIO(),
  footer: new FooterIO()
};
var sections_default = sections;
var TerrariaWorldFileError = class extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = "TerrariaWorldParserError";
  }
};
var FileReader = class {
  constructor() {
    this.defaultOptions = {
      ignorePointers: false,
      dataRecovery: false,
      sections: Object.keys(sections_default),
      ignoreBounds: false,
      progressCallback: null
    };
  }
  setOptions(options = {}) {
    this.ignorePointers = options.ignorePointers ?? this.defaultOptions.ignorePointers;
    this.dataRecovery = options.dataRecovery ?? this.defaultOptions.dataRecovery;
    this.selectedSections = options.sections ?? this.defaultOptions.sections;
    this.reader.ignoreBounds = options.ignoreBounds ?? this.defaultOptions.ignoreBounds;
    this.reader.progressCallback = options.progressCallback ?? this.defaultOptions.progressCallback;
  }
  async loadFile(loader, file) {
    return this.loadBuffer(await loader(file));
  }
  async loadBuffer(buffer) {
    this.reader = new BinaryReader().loadBuffer(buffer);
    return this;
  }
  parse(options) {
    const world = this.parseWorldProperties();
    this.setOptions(options);
    let data = {};
    for (let [sectionName, sectionIO] of Object.entries(sections_default)) {
      if (!this.selectedSections.includes(sectionName) || world.version < 225 && ["bestiary", "creativePowers"].includes(sectionName)) continue;
      const sectionIndex = Object.keys(sections_default).indexOf(sectionName);
      this.reader.jumpTo(world.pointers[sectionIndex]);
      data[sectionName] = sectionIO.parse(this.reader, world);
      if (!this.ignorePointers && this.reader.getPosition() != world.pointers[sectionIndex + 1] && !this.reader.isFinished()) throw new TerrariaWorldFileError(`Section ${sectionName} parsing ended at wrong point, ${this.reader.getPosition()} != ${world.pointers[sectionIndex + 1]}`);
    }
    return data;
  }
  parseWorldProperties() {
    let data = {};
    try {
      this.reader.jumpTo(0);
      data.version = this.reader.readInt32();
      data.magicNumber = this.reader.readString(7);
      data.fileType = this.reader.readUInt8();
      this.reader.skipBytes(12);
      data.pointers = [0, ...this.reader.readArray(this.reader.readInt16(), () => this.reader.readInt32())];
      data.importants = this.reader.readBits(this.reader.readInt16());
      data.mapName = this.reader.readString();
      this.reader.readString();
      this.reader.skipBytes(24);
      data.worldId = this.reader.readInt32();
      this.reader.skipBytes(16);
      data.height = this.reader.readInt32();
      data.width = this.reader.readInt32();
      this.reader.jumpTo(0);
    } catch (e) {
      throw new TerrariaWorldFileError("Invalid file");
    }
    if (![
      8400,
      6400,
      4200
    ].includes(data.width) || ![
      2400,
      1800,
      1200
    ].includes(data.height)) throw new TerrariaWorldFileError("Invalid file");
    if (data.magicNumber != "relogic" || data.fileType != 2) throw new TerrariaWorldFileError("Wrong file type");
    if (data.version < 194) throw new TerrariaWorldFileError("Map file is too old");
    return data;
  }
};

// node_modules/terraria-world-file/dist/platform/browser.mjs
async function fileLoader(file) {
  return file.arrayBuffer();
}

// examples/map-from-parsed-world.mjs
var RELOGIC_MAGIC = 27981915666277746n;
var FILE_TYPE_MAP = 1n;
var WORLD_GUID_VERSION = 777389080577n;
var TILE_OPTION_RANGES = "0-3:1,4-5:2,6-14:1,15:2,16-18:1,19:2,20:1,21:5,22-25:1,26-27:2,28:9,29-30:1,31:2,32-79:1,80:4,81:1,82-84:7,85-88:1,89:3,90-104:1,105:3,106-126:1,128:1,129:2,130-132:1,133-134:2,136:1,137:3,138-148:1,149:3,150-159:1,160:9,161-164:1,165:4,166-177:1,178:7,179-183:1,184:11,185-187:12,188-209:1,211-226:1,227:12,228-239:1,240:5,241:1,242:2,243-418:1,419:3,420:6,421-422:1,423:7,424-427:1,429-439:1,440:7,441:5,442-452:1,453:3,454-456:1,457:5,458-460:1,461:4,462-466:1,467-468:12,469-486:1,487:2,488-492:1,493:6,494-503:1,505-517:1,518:3,519:6,520-528:1,529:5,530:4,531-540:1,542-547:1,548:2,549-559:1,560:3,561-571:1,572:6,573-590:1,591:9,592-596:1,597:11,598-626:1,627-628:9,629-646:1,647-650:12,651-652:1,653:9,654-691:1,692:9,693-694:4,695-696:2,697-704:1,705:4,706-752:1";
var WALL_OPTION_RANGES = "1-20:1,22-26:1,27:2,28-87:1,94-105:1,108-144:1,146-149:1,151:1,153-167:1,169-240:1,242-317:1,319-366:1";
var SNOW_TILE_IDS = /* @__PURE__ */ new Set([147, 161, 162, 163, 164, 200]);
var PREVIEW_COLORS = /* @__PURE__ */ new Map([
  [0, [151, 107, 75]],
  [1, [128, 128, 128]],
  [2, [28, 216, 94]],
  [3, [26, 196, 84]],
  [4, [253, 221, 3]],
  [5, [151, 107, 75]],
  [7, [150, 67, 22]],
  [8, [185, 164, 23]],
  [9, [185, 194, 195]],
  [22, [98, 95, 167]],
  [25, [109, 90, 128]],
  [41, [66, 84, 109]],
  [53, [186, 168, 84]],
  [60, [143, 215, 29]],
  [109, [78, 193, 227]],
  [147, [211, 236, 241]],
  [161, [144, 195, 232]],
  [162, [184, 219, 240]],
  [163, [174, 145, 214]],
  [164, [218, 182, 204]],
  [326, [9, 61, 191]],
  [327, [253, 32, 3]],
  [345, [255, 156, 12]],
  [447, [179, 132, 255]]
]);
function applyRanges(target, ranges) {
  for (const entry of ranges.split(",")) {
    const [range, countText] = entry.split(":");
    const [startText, endText = startText] = range.split("-");
    const count = Number(countText);
    for (let id = Number(startText), end = Number(endText); id <= end && id < target.length; id++) {
      target[id] = count;
    }
  }
}
function createLookup(counts, position) {
  const lookup = new Uint16Array(counts.length);
  for (let id = 0; id < counts.length; id++) {
    if (counts[id] > 0) {
      lookup[id] = position;
      position = position + counts[id] & 65535;
    }
  }
  return { lookup, nextPosition: position };
}
function createPalette(maxTileId, maxWallId) {
  const tileOptionCounts = new Uint8Array(maxTileId + 1);
  const wallOptionCounts = new Uint8Array(maxWallId + 1);
  applyRanges(tileOptionCounts, TILE_OPTION_RANGES);
  applyRanges(wallOptionCounts, WALL_OPTION_RANGES);
  const tiles = createLookup(tileOptionCounts, 0);
  const walls = createLookup(wallOptionCounts, tiles.nextPosition);
  return { tileOptionCounts, wallOptionCounts, tileLookup: tiles.lookup, wallLookup: walls.lookup };
}
var ByteWriter = class {
  constructor() {
    this.chunks = [];
    this.chunk = new Uint8Array(16384);
    this.offset = 0;
    this.length = 0;
  }
  writeByte(value) {
    if (this.offset === this.chunk.length) this.flush();
    this.chunk[this.offset++] = value & 255;
    this.length++;
  }
  writeInt16(value) {
    this.writeByte(value);
    this.writeByte(value >> 8);
  }
  writeInt32(value) {
    this.writeByte(value);
    this.writeByte(value >>> 8);
    this.writeByte(value >>> 16);
    this.writeByte(value >>> 24);
  }
  writeUInt64(value) {
    let remaining = BigInt.asUintN(64, BigInt(value));
    for (let index = 0; index < 8; index++) {
      this.writeByte(Number(remaining & 0xffn));
      remaining >>= 8n;
    }
  }
  writeString(value) {
    const bytes = new TextEncoder().encode(String(value));
    let length = bytes.length;
    while (length >= 128) {
      this.writeByte(length & 127 | 128);
      length = Math.floor(length / 128);
    }
    this.writeByte(length);
    this.writeBytes(bytes);
  }
  writeBytes(bytes) {
    let start = 0;
    while (start < bytes.length) {
      if (this.offset === this.chunk.length) this.flush();
      const copied = Math.min(this.chunk.length - this.offset, bytes.length - start);
      this.chunk.set(bytes.subarray(start, start + copied), this.offset);
      this.offset += copied;
      this.length += copied;
      start += copied;
    }
  }
  flush() {
    if (this.offset > 0) this.chunks.push(this.chunk.subarray(0, this.offset));
    this.chunk = new Uint8Array(16384);
    this.offset = 0;
  }
  finish() {
    const result = new Uint8Array(this.length);
    let offset = 0;
    for (const chunk of this.chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    result.set(this.chunk.subarray(0, this.offset), offset);
    return result;
  }
};
function writeOptionCounts(writer, counts) {
  let byte = 0;
  let bit = 0;
  for (const count of counts) {
    if (count !== 1) byte |= 1 << bit;
    if (++bit === 8) {
      writer.writeByte(byte);
      byte = 0;
      bit = 0;
    }
  }
  if (bit !== 0) writer.writeByte(byte);
}
function writeCounts(writer, counts) {
  for (const count of counts) {
    if (count !== 1) writer.writeByte(count);
  }
}
function getGuid(header) {
  if (header.guidString) return header.guidString;
  const bytes = Array.from(header.guid ?? []);
  if (bytes.length !== 16) return "";
  const hex = (index) => bytes[index].toString(16).padStart(2, "0");
  return [
    [3, 2, 1, 0].map(hex).join(""),
    [5, 4].map(hex).join(""),
    [7, 6].map(hex).join(""),
    [8, 9].map(hex).join(""),
    [10, 11, 12, 13, 14, 15].map(hex).join("")
  ].join("-");
}
function getWorldGeneratorVersion(header) {
  if (typeof header.worldGeneratorVersion === "bigint") return header.worldGeneratorVersion;
  const bytes = header.worldGeneratorVersion;
  if (!bytes || bytes.length !== 8) return 0n;
  let result = 0n;
  for (let index = bytes.length - 1; index >= 0; index--) {
    result = result << 8n | BigInt(bytes[index]);
  }
  return result;
}
function getTile(worldTiles, x, y) {
  const tile = worldTiles.tiles?.[x]?.[y];
  if (!tile) throw new RangeError(`Missing parsed tile at (${x}, ${y}).`);
  return tile;
}
function mapTileData(tile, palette, worldTiles, x, y, width, height, groundLevel) {
  let paintColor = 0;
  let tileData;
  let colorOffset = 1;
  let hasLight = true;
  const liquidAmount = tile.liquidAmount ?? 0;
  if (liquidAmount > 0) {
    const liquidTileIds = [326, 327, 345, 447];
    const liquidIndex = (tile.liquidType ?? 1) - 1;
    const liquidTileId = liquidTileIds[liquidIndex] ?? 326;
    tileData = palette.tileLookup[liquidTileId];
  } else if (tile.blockId !== void 0 && tile.blockId >= 0) {
    paintColor = tile.blockColor ?? 0;
    tileData = palette.tileLookup[tile.blockId];
  } else if ((tile.wallId ?? 0) > 0) {
    paintColor = tile.wallColor ?? 0;
    tileData = palette.wallLookup[tile.wallId];
  } else if (y < groundLevel || y >= height - 200) {
    colorOffset = 6;
    hasLight = false;
    tileData = 0;
  } else {
    colorOffset = 7;
    tileData = computeSnowiness(worldTiles, x, y, width, height);
  }
  if (tileData === void 0) {
    throw new RangeError(`No map lookup for tile ${tile.blockId ?? tile.wallId} at (${x}, ${y}).`);
  }
  return { paintColor, tileData, colorOffset, hasLight };
}
function computeSnowiness(worldTiles, x, y, width, height) {
  for (let scanX = x - 36; scanX <= x + 30; scanX += 10) {
    for (let scanY = y - 36; scanY <= y + 30; scanY += 10) {
      if (scanX < 0 || scanY < 0 || scanX >= width || scanY >= height) continue;
      const tile = getTile(worldTiles, scanX, scanY);
      if (tile.blockId !== void 0 && SNOW_TILE_IDS.has(tile.blockId)) return 255;
    }
  }
  return 0;
}
async function writeMapData(worldTiles, palette, width, height, groundLevel, onProgress) {
  const writer = new ByteWriter();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const { paintColor, tileData, colorOffset, hasLight } = mapTileData(
        getTile(worldTiles, x, y),
        palette,
        worldTiles,
        x,
        y,
        width,
        height,
        groundLevel
      );
      const flagByte = paintColor > 0 ? paintColor << 1 & 255 : 0;
      let colorByte = colorOffset << 1 | 32;
      if (flagByte !== 0) colorByte |= 1;
      if (tileData > 255) colorByte |= 16;
      writer.writeByte(colorByte);
      if (flagByte !== 0) writer.writeByte(flagByte);
      if (hasLight) {
        writer.writeByte(tileData);
        if (tileData > 255) writer.writeByte(tileData >> 8);
      }
      writer.writeByte(255);
    }
    if (y % 16 === 15 || y === height - 1) {
      onProgress(Math.round((y + 1) / height * 100));
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
  return writer.finish();
}
function createMapPreview(parsedWorld, maxWidth = 900, maxHeight = 560) {
  const header = parsedWorld.header;
  const worldTiles = parsedWorld.worldTiles;
  const width = header.maxTilesX;
  const height = header.maxTilesY;
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  const previewWidth = Math.max(1, Math.floor(width * scale));
  const previewHeight = Math.max(1, Math.floor(height * scale));
  const pixels = new Uint8ClampedArray(previewWidth * previewHeight * 4);
  const groundLevel = header.worldSurface ?? 0;
  for (let previewY = 0; previewY < previewHeight; previewY++) {
    const y = Math.min(height - 1, Math.floor(previewY * height / previewHeight));
    for (let previewX = 0; previewX < previewWidth; previewX++) {
      const x = Math.min(width - 1, Math.floor(previewX * width / previewWidth));
      const tile = getTile(worldTiles, x, y);
      let color;
      if ((tile.liquidAmount ?? 0) > 0) {
        color = tile.liquidType === 2 ? [244, 76, 46] : tile.liquidType === 3 ? [246, 174, 41] : [75, 174, 208];
      } else if (tile.blockId !== void 0) {
        color = PREVIEW_COLORS.get(tile.blockId) ?? [147, 150, 137];
      } else if ((tile.wallId ?? 0) > 0) {
        color = [98, 91, 83];
      } else if (y < groundLevel || y >= height - 200) {
        color = [145, 205, 211];
      } else {
        color = [119, 91, 68];
      }
      const offset = (previewY * previewWidth + previewX) * 4;
      pixels[offset] = color[0];
      pixels[offset + 1] = color[1];
      pixels[offset + 2] = color[2];
      pixels[offset + 3] = 255;
    }
  }
  return { width: previewWidth, height: previewHeight, pixels };
}
async function buildMapFromParsedWorld(parsedWorld, { compress, onProgress = () => {
}, maxTileId = 753, maxWallId = 366 } = {}) {
  if (typeof compress !== "function") throw new TypeError("A raw DEFLATE compressor is required.");
  const fileHeader = parsedWorld?.fileFormatHeader;
  const header = parsedWorld?.header;
  const worldTiles = parsedWorld?.worldTiles;
  if (!fileHeader || !header || !worldTiles?.tiles) {
    throw new TypeError("Parsed world must contain fileFormatHeader, header, and worldTiles.");
  }
  const width = header.maxTilesX;
  const height = header.maxTilesY;
  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    throw new RangeError("Parsed world dimensions are invalid.");
  }
  const palette = createPalette(maxTileId, maxWallId);
  const metadata = new ByteWriter();
  const revision = (fileHeader.revision ?? 0) + 1 >>> 0;
  const title = header.mapName ?? "";
  const worldId = header.worldId ?? 0;
  const groundLevel = header.worldSurface ?? 0;
  metadata.writeInt32(fileHeader.version);
  metadata.writeUInt64(RELOGIC_MAGIC | FILE_TYPE_MAP << 56n);
  metadata.writeInt32(revision);
  metadata.writeUInt64(fileHeader.favorite ? 1n : 0n);
  metadata.writeString(title);
  metadata.writeInt32(worldId);
  metadata.writeInt32(height);
  metadata.writeInt32(width);
  metadata.writeInt16(maxTileId + 1);
  metadata.writeInt16(maxWallId + 1);
  metadata.writeBytes(new Uint8Array([4, 0, 0, 1, 0, 1, 0, 1]));
  writeOptionCounts(metadata, palette.tileOptionCounts);
  writeOptionCounts(metadata, palette.wallOptionCounts);
  writeCounts(metadata, palette.tileOptionCounts);
  writeCounts(metadata, palette.wallOptionCounts);
  const metadataBytes = metadata.finish();
  const rawMap = await writeMapData(worldTiles, palette, width, height, groundLevel, onProgress);
  const compressedMap = compress(rawMap, { level: 6 });
  const bytes = new Uint8Array(metadataBytes.length + compressedMap.length);
  bytes.set(metadataBytes);
  bytes.set(compressedMap, metadataBytes.length);
  fileHeader.revision = revision;
  const worldGeneratorVersion = getWorldGeneratorVersion(header);
  const fileName = worldGeneratorVersion >= WORLD_GUID_VERSION ? `${getGuid(header)}.map` : `${worldId}.map`;
  return { bytes, fileName, metadataBytes: metadataBytes.length, width, height, title, revision };
}

// examples/wld-worker.mjs
self.onmessage = async (event) => {
  const { file } = event.data;
  try {
    self.postMessage({ type: "status", message: "Reading world file\u2026" });
    const parser = await new FileReader().loadFile(fileLoader, file);
    self.postMessage({ type: "status", message: "Parsing world tiles\u2026" });
    const parsedWorld = parser.parse({
      sections: ["fileFormatHeader", "header", "worldTiles"]
    });
    const preview = createMapPreview(parsedWorld);
    const worldInfo = {
      title: parsedWorld.header.mapName,
      width: parsedWorld.header.maxTilesX,
      height: parsedWorld.header.maxTilesY,
      version: parsedWorld.fileFormatHeader.version
    };
    self.postMessage({ type: "preview", preview, worldInfo }, [preview.pixels.buffer]);
    self.postMessage({ type: "status", message: "Encoding map data\u2026" });
    const result = await buildMapFromParsedWorld(parsedWorld, {
      compress: deflateSync,
      onProgress: (percent) => self.postMessage({ type: "progress", percent })
    });
    self.postMessage({
      type: "complete",
      fileName: result.fileName,
      width: result.width,
      height: result.height,
      bytes: result.bytes.buffer
    }, [result.bytes.buffer]);
  } catch (error) {
    self.postMessage({ type: "error", message: error instanceof Error ? error.message : String(error) });
  }
};
