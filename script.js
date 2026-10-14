(function () {
  "use strict";

  // Math rendering: inline spans (.m) and display blocks (.eq) hold TeX source.
  function renderMath() {
    if (!window.katex) return;
    document.querySelectorAll(".m, .eq").forEach(function (el) {
      var display = el.classList.contains("eq");
      try {
        katex.render(el.textContent, el, { displayMode: display, throwOnError: false });
      } catch (e) { /* leave source text in place */ }
    });
  }

  // Zero-order hold calculator.
  var ids = ["za", "zb", "zd"].map(function (i) { return document.getElementById(i); });
  function fmt(x) { return Math.abs(x) < 0.00005 && x !== 0 ? x.toExponential(3) : x.toFixed(4); }
  function zoh() {
    var a = parseFloat(ids[0].value), b = parseFloat(ids[1].value), d = parseFloat(ids[2].value);
    var abar = document.getElementById("zabar"), bbar = document.getElementById("zbbar"), st = document.getElementById("zstab");
    if ([a, b, d].some(isNaN) || a === 0) { abar.textContent = bbar.textContent = st.textContent = "a must be nonzero"; return; }
    var ab = Math.exp(a * d), bb = (ab - 1) / a * b;
    abar.textContent = fmt(ab); bbar.textContent = fmt(bb);
    st.textContent = Math.abs(ab) < 1 ? "yes" : "no";
  }
  ids.forEach(function (el) { el.addEventListener("input", zoh); });
  zoh();

  // Scan depth table and chart.
  function rounds(n) { return Math.ceil(Math.log2(n)); }
  function padded(n) { return Math.pow(2, rounds(n)); }
  var tb = document.querySelector("#scantable tbody");
  [100, 1000, 10000, 100000, 1000000].forEach(function (L) {
    var n = L + 1, tr = document.createElement("tr");
    [L, n, padded(n), rounds(n), L].forEach(function (v) {
      var td = document.createElement("td"); td.textContent = v.toLocaleString("en-US"); tr.appendChild(td);
    });
    tb.appendChild(tr);
  });

  (function chart() {
    var W = 640, H = 260, m = { l: 44, r: 14, t: 14, b: 38 }, ns = "http://www.w3.org/2000/svg";
    var minE = 1, maxE = 6, maxY = 20;
    var styles = getComputedStyle(document.documentElement);
    var rule = styles.getPropertyValue("--rule").trim();
    var accent = styles.getPropertyValue("--accent").trim();
    var x = function (L) { return m.l + (Math.log10(L) - minE) / (maxE - minE) * (W - m.l - m.r); };
    var y = function (r) { return H - m.b - r / maxY * (H - m.t - m.b); };
    var s = '<svg viewBox="0 0 ' + W + " " + H + '">';
    for (var r = 0; r <= maxY; r += 5)
      s += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y(r) + '" y2="' + y(r) + '" stroke="' + rule + '" stroke-width="1"/><text x="' + (m.l - 8) + '" y="' + (y(r) + 4) + '" text-anchor="end">' + r + "</text>";
    for (var e = minE; e <= maxE; e++)
      s += '<text x="' + x(Math.pow(10, e)) + '" y="' + (H - m.b + 18) + '" text-anchor="middle">10<tspan baseline-shift="super" font-size="8">' + e + "</tspan></text>";
    var pts = [], L;
    for (var k = minE; k <= maxE; k += 0.02) { L = Math.pow(10, k); pts.push(x(L).toFixed(1) + "," + y(rounds(Math.round(L) + 1)).toFixed(1)); }
    s += '<polyline fill="none" stroke="' + accent + '" stroke-width="2" points="' + pts.join(" ") + '"/>';
    [1000, 1000000].forEach(function (v) {
      s += '<circle cx="' + x(v) + '" cy="' + y(rounds(v + 1)) + '" r="4" fill="' + accent + '"/><text x="' + (x(v) - 6) + '" y="' + (y(rounds(v + 1)) - 9) + '" text-anchor="end">L = ' + v.toLocaleString("en-US") + ": " + rounds(v + 1) + " rounds</text>";
    });
    s += '<text x="' + (W / 2) + '" y="' + (H - 4) + '" text-anchor="middle">Sequence length L</text></svg>';
    document.getElementById("scanchart").innerHTML = s;
  })();

  // Contents highlighting.
  var links = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    document.querySelectorAll("main section").forEach(function (sec) { io.observe(sec); });
  }

  if (window.katex) renderMath(); else window.addEventListener("load", renderMath);
})();
