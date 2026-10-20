/* MindLoop question generators.
   Each generator takes a level (0 easier, 1 normal, 2 harder) and returns one question:
   - typed answer:   { html, words?, ans: number, ansText, remind, worked: [steps] }
   - multiple choice: { html, words?, choices: [html], ans: index, ansText, remind, worked, diagram? }
   Answers are always worked out by code, never guessed. */
(function () {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
  const fr = (n, d) => `<span class="fr"><span>${n}</span><span>${d}</span></span>`;
  const num = x => String(+(+x).toFixed(3));
  const money = x => "$" + (Number.isInteger(x) ? x : x.toFixed(2));
  const fmt = n => n.toLocaleString("en-AU");
  const gcd = (a, b) => b ? gcd(b, a % b) : a;

  // Multiple choice: correct answer + distractors, deduplicated and shuffled.
  function mc(q, correct, wrong, rest) {
    const seen = new Set([String(correct)]);
    const ws = wrong.filter(w => { const k = String(w); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 3);
    const choices = shuffle([correct, ...ws].map(String));
    return Object.assign({ html: q, choices, ans: choices.indexOf(String(correct)), ansText: String(correct) }, rest);
  }

  // ---------- SVG helpers (use currentColor so they follow the theme) ----------
  const svg = (w, h, body, label) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" style="max-width:100%;height:auto" role="img" aria-label="${label}" fill="none" stroke="currentColor">${body}</svg>`;

  function angleSVG(deg) {
    const cx = 110, cy = 110, r = 90, a = deg * Math.PI / 180;
    const x2 = cx + r * Math.cos(-a), y2 = cy + r * Math.sin(-a);
    const ar = 28, large = deg > 180 ? 1 : 0;
    const ax = cx + ar * Math.cos(-a), ay = cy + ar * Math.sin(-a);
    return svg(240, deg > 180 ? 220 : 128, `<line x1="${cx}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke-width="4" stroke-linecap="round"/>
      <line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-width="4" stroke-linecap="round"/>
      ${deg === 90 ? `<path d="M${cx + 18} ${cy} V${cy - 18} H${cx}" stroke-width="2"/>` : `<path d="M${cx + ar} ${cy} A${ar} ${ar} 0 ${large} 0 ${ax.toFixed(1)} ${ay.toFixed(1)}" stroke="#2D57CC" stroke-width="3"/>`}
      <circle cx="${cx}" cy="${cy}" r="4" fill="currentColor"/>`, `An angle`);
  }

  function gridSVG(px, py, n = 6) {
    const s = 32, o = 30, W = o + n * s + 16;
    let b = "";
    for (let i = 0; i <= n; i++) {
      b += `<line x1="${o + i * s}" y1="${10}" x2="${o + i * s}" y2="${10 + n * s}" stroke-opacity=".25"/>`;
      b += `<line x1="${o}" y1="${10 + i * s}" x2="${o + n * s}" y2="${10 + i * s}" stroke-opacity=".25"/>`;
      b += `<text x="${o + i * s}" y="${10 + n * s + 18}" text-anchor="middle" fill="currentColor" stroke="none" font-size="12">${i}</text>`;
      b += `<text x="${o - 12}" y="${10 + (n - i) * s + 4}" text-anchor="middle" fill="currentColor" stroke="none" font-size="12">${i}</text>`;
    }
    b += `<line x1="${o}" y1="${10 + n * s}" x2="${o + n * s}" y2="${10 + n * s}" stroke-width="2"/><line x1="${o}" y1="10" x2="${o}" y2="${10 + n * s}" stroke-width="2"/>`;
    b += `<circle cx="${o + px * s}" cy="${10 + (n - py) * s}" r="7" fill="#2D57CC" stroke="none"/>`;
    return svg(W, 10 + n * s + 28, b, "A coordinate grid with one point");
  }

  // An L-shaped flag shape, and its transformed copy.
  const SHAPE = [[0, 0], [3, 0], [3, 1], [1, 1], [1, 3], [0, 3]];
  function shapePath(pts, s, ox, oy) { return "M" + pts.map(([x, y]) => `${ox + x * s} ${oy - y * s}`).join(" L") + " Z"; }
  function transformSVG(kind) {
    const s = 22, base = 100;
    let pts2;
    if (kind === "translation") pts2 = SHAPE.map(([x, y]) => [x + 5, y + 1]);
    if (kind === "reflection") pts2 = SHAPE.map(([x, y]) => [9 - x, y]);
    if (kind === "rotation") pts2 = SHAPE.map(([x, y]) => [7 + y, 3 - x]);
    return svg(260, 120, `${kind === "reflection" ? `<line x1="${10 + 4.5 * s}" y1="5" x2="${10 + 4.5 * s}" y2="115" stroke-dasharray="5 5" stroke-opacity=".5"/>` : ""}
      <path d="${shapePath(SHAPE, s, 10, base)}" fill="#2D57CC" fill-opacity=".25" stroke="#2D57CC" stroke-width="2"/>
      <path d="${shapePath(pts2, s, 10, base)}" fill="#E8B923" fill-opacity=".35" stroke="#B88A00" stroke-width="2"/>
      <text x="20" y="115" fill="currentColor" stroke="none" font-size="12">Before</text><text x="200" y="115" fill="currentColor" stroke="none" font-size="12">After</text>`, "Two shapes, before and after a move");
  }

  function lineGraphSVG(vals, labels) {
    const W = 360, H = 200, l = 40, b = 160, t = 15, max = Math.ceil(Math.max(...vals) / 5) * 5 + 5;
    const xs = i => l + i * ((W - l - 20) / (vals.length - 1)), ys = v => b - (v / max) * (b - t);
    let g = "";
    for (let v = 0; v <= max; v += 5) g += `<line x1="${l}" x2="${W - 10}" y1="${ys(v)}" y2="${ys(v)}" stroke-opacity=".15"/><text x="${l - 8}" y="${ys(v) + 4}" text-anchor="end" fill="currentColor" stroke="none" font-size="11">${v}</text>`;
    labels.forEach((lb, i) => g += `<text x="${xs(i)}" y="${b + 18}" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">${lb}</text>`);
    g += `<polyline points="${vals.map((v, i) => `${xs(i)},${ys(v)}`).join(" ")}" stroke="#2D57CC" stroke-width="3"/>`;
    g += vals.map((v, i) => `<circle cx="${xs(i)}" cy="${ys(v)}" r="4" fill="#2D57CC" stroke="none"/>`).join("");
    g += `<text x="${l}" y="${H - 4}" fill="currentColor" stroke="none" font-size="11">Time of day</text><text x="4" y="10" fill="currentColor" stroke="none" font-size="11">°C</text>`;
    return svg(W, H, g, "A line graph of temperature during the day");
  }

  function hundredGrid(n) {
    let b = "";
    for (let i = 0; i < 100; i++) { const x = (i % 10) * 16, y = Math.floor(i / 10) * 16;
      b += `<rect x="${x + 1}" y="${y + 1}" width="14" height="14" rx="2" ${i < n ? 'fill="#2D57CC" stroke="#2D57CC"' : 'stroke-opacity=".35"'}/>`; }
    return svg(162, 162, b, `A 100-square grid with ${n} squares shaded`);
  }

  const G = {};

  G["decimal-compare"] = lv => {
    const w = rnd(1, 9), a = rnd(lv ? 100 : 10, lv ? 999 : 99) / (lv ? 1000 : 100);
    let b; do { b = +(a + pick([-1, 1]) * pick(lv ? [0.001, 0.01, 0.009, 0.1, 0.05] : [0.01, 0.1, 0.05])).toFixed(3); } while (b <= 0 || b >= 1 || b === a);
    const A = num(w + a), B = num(w + b), big = Math.max(+A, +B), small = Math.min(+A, +B);
    return mc(`Which number is bigger?`, num(big), [num(small), "They're equal"], {
      remind: "Line up the decimal points and compare place by place from the left. The first different digit decides.",
      worked: ["Compare 3.405 and 3.45.", "Ones: 3 and 3, same. Tenths: 4 and 4, same.", "Hundredths: 0 and 5. 5 is bigger, so 3.45 is bigger."], words: true,
      extra: `<div class="qtext">${A} &nbsp;or&nbsp; ${B}</div>` });
  };

  G["factors-multiples"] = lv => {
    const type = pick(["factor", "multiple", "divisible"]);
    if (type === "factor") {
      const n = pick(lv ? [36, 48, 60, 72, 84] : [12, 18, 20, 24, 30]);
      const fs = []; for (let i = 2; i < n; i++) if (n % i === 0) fs.push(i);
      const f = pick(fs); const non = []; for (let i = 2; i < 13; i++) if (n % i) non.push(i);
      return mc(`Which of these is a factor of ${n}?`, f, shuffle(non), { words: true,
        remind: `A factor of ${n} divides into ${n} exactly, with nothing left over.`,
        worked: ["Is 5 a factor of 30?", "30 ÷ 5 = 6 exactly, nothing left over.", "So yes, 5 is a factor of 30."] });
    }
    if (type === "multiple") {
      const k = rnd(3, lv ? 12 : 9), m = k * rnd(3, 9);
      return mc(`Which of these is a multiple of ${k}?`, m, [m + 1, m - 2, m + k - 1, m + 2].filter(x => x % k), { words: true,
        remind: `Multiples of ${k} are the answers in the ${k} times table.`,
        worked: ["Is 28 a multiple of 4?", "4 × 7 = 28.", "So yes, 28 is in the 4 times table."] });
    }
    const d = rnd(3, 9), yes = Math.random() < .5, n = d * rnd(4, lv ? 20 : 12) + (yes ? 0 : rnd(1, d - 1));
    return mc(`Is ${n} divisible by ${d}?`, yes ? "Yes" : "No", [yes ? "No" : "Yes"], { words: true,
      remind: `Divide ${n} by ${d}. If there's nothing left over, it's divisible.`,
      worked: ["Is 34 divisible by 6?", "6 × 5 = 30 and 6 × 6 = 36, so 34 ÷ 6 = 5 remainder 4.", "There's a remainder, so no."] });
  };

  G["fraction-compare"] = lv => {
    const d = pick([2, 3, 4, 5]), k = pick(lv === 0 ? [2] : [2, 3]), D = d * k;
    let a = rnd(1, d - 1), b; do { b = rnd(1, D - 1); } while (b === a * k);
    const v1 = a / d, v2 = b / D, A = `${a}/${d}`, B = `${b}/${D}`;
    const correct = v1 > v2 ? A : B;
    const view = s => { const [n, m] = s.split("/"); return fr(n, m); };
    const q = mc(`Which fraction is bigger?`, correct, [correct === A ? B : A, "They're equal"], {
      remind: `Change ${a}/${d} into ${D}ths: multiply top and bottom by ${k} to get ${a * k}/${D}. Then compare the tops.`,
      worked: ["Compare 1/4 and 3/8.", "1/4 = 2/8 (multiply top and bottom by 2).", "3/8 is bigger than 2/8, so 3/8 is bigger."],
      extra: `<div class="qtext">${view(A)} &nbsp;or&nbsp; ${view(B)}</div>`, words: true });
    q.choices = q.choices.map(c => c.includes("/") ? view(c) : c);
    return q;
  };

  G["percent"] = lv => {
    if (Math.random() < .55) {
      const n = lv === 0 ? pick([10, 20, 25, 50, 75]) : rnd(5, 95);
      return { html: `What percentage of the grid is shaded?`, words: true, diagram: hundredGrid(n), ans: n, ansText: n + "%",
        remind: "The grid has 100 squares. Count the shaded ones: that number is the percentage.",
        worked: ["A grid has 43 of its 100 squares shaded.", "Per cent means out of 100.", "So 43% is shaded."] };
    }
    const [p, f] = pick([["50%", "1/2"], ["25%", "1/4"], ["75%", "3/4"], ["10%", "1/10"], ["100%", "the whole"]]);
    return mc(`Which is the same as ${p}?`, f, ["1/2", "1/4", "3/4", "1/10", "1/5", "the whole"].filter(x => x !== f), { words: true,
      remind: "Per cent means out of 100. 50% = 50 out of 100 = 1/2. 25% = 1/4. 10% = 1/10.",
      worked: ["What is 25% as a fraction?", "25% = 25 out of 100.", "25/100 = 1/4, a quarter."] });
  };

  G["fraction-add-same-denominator"] = lv => {
    const d = pick(lv === 0 ? [3, 4, 5] : lv === 1 ? [4, 5, 6, 8, 10] : [6, 8, 10, 12]);
    const sub = Math.random() < .35;
    let a, b;
    if (sub) { a = rnd(2, d - 1); b = rnd(1, a - 1); }
    else if (lv < 2) { a = rnd(1, d - 2); b = rnd(1, d - 1 - a); }
    else { a = rnd(2, d - 1); b = rnd(2, d - 1); }
    const r = sub ? a - b : a + b, op = sub ? "−" : "+";
    return { html: `${fr(a, d)} ${op} ${fr(b, d)} = ?`, ans: r / d, ansText: `${r}/${d}`,
      remind: `Both fractions have ${d} on the bottom, so keep ${d}. ${sub ? "Take away" : "Add"} just the top numbers.`,
      worked: sub ? ["Look at 5/7 − 2/7. Both bottoms are 7, so keep the 7.", "Take away the tops: 5 − 2 = 3.", "Answer: 3/7."]
                  : ["Look at 2/7 + 3/7. Both bottoms are 7, so keep the 7.", "Add the tops: 2 + 3 = 5.", "Answer: 5/7."] };
  };

  G["multiply-larger"] = lv => {
    let a, b;
    if (lv === 0) { a = rnd(21, 99); b = rnd(2, 9); } else if (lv === 1) { a = rnd(101, 999); b = rnd(3, 9); } else { a = rnd(21, 99); b = rnd(12, 49); }
    return { html: `${a} × ${b} = ?`, ans: a * b, ansText: fmt(a * b),
      remind: b < 10 ? `Split ${a} into hundreds, tens and ones. Multiply each part by ${b}, then add.` : `Split ${b} into ${b - b % 10} + ${b % 10}. Do ${a} × ${b - b % 10} and ${a} × ${b % 10}, then add.`,
      worked: ["Look at 34 × 26.", "34 × 20 = 680 and 34 × 6 = 204.", "680 + 204 = 884."] };
  };

  G["divide-remainder"] = lv => {
    const d = rnd(3, 9), q = rnd(4, lv ? 15 : 9), r = rnd(1, d - 1), n = d * q + r;
    const story = pick([
      { t: `${n} students are going on an excursion. Each car fits ${d} students. How many cars are needed?`, a: q + 1, why: `${n} ÷ ${d} = ${q} remainder ${r}. The ${r} leftover students still need a car, so it's ${q + 1}.` },
      { t: `${n} lollies are shared equally between ${d} kids. How many lollies does each kid get?`, a: q, why: `${n} ÷ ${d} = ${q} remainder ${r}. Each kid gets ${q}; ${r} are left over.` },
      { t: `${n} ÷ ${d} = ? remainder ?. What is the remainder?`, a: r, why: `${d} × ${q} = ${d * q}, and ${n} − ${d * q} = ${r}.` }]);
    return { html: story.t, words: true, ans: story.a, ansText: String(story.a), remind: story.why,
      worked: ["47 people, 5 per car. How many cars?", "47 ÷ 5 = 9 remainder 2.", "The 2 leftover people need a car too, so 10 cars."] };
  };

  G["estimate"] = lv => {
    if (Math.random() < .5) {
      const a = rnd(lv ? 120 : 110, lv ? 880 : 490), b = rnd(lv ? 120 : 110, lv ? 880 : 490), R = x => Math.round(x / 100) * 100;
      const e = R(a) + R(b);
      return mc(`Which is the best estimate of ${a} + ${b}?`, fmt(e), [fmt(e + 100), fmt(e - 100), fmt(e * 10), fmt(e + 200)], { words: true,
        remind: `Round each number to the nearest hundred: ${a} ≈ ${R(a)} and ${b} ≈ ${R(b)}. Then add.`,
        worked: ["Estimate 398 + 512.", "398 ≈ 400 and 512 ≈ 500.", "400 + 500 = 900."] });
    }
    const p = pick([1.95, 2.95, 3.99, 4.95, 9.95]), n = rnd(2, 6), e = Math.round(p) * n;
    return mc(`You buy ${n} items at ${money(p)} each. About how much will it cost?`, "$" + e, ["$" + (e + n), "$" + (e * 10), "$" + Math.max(1, e - 2 * n), "$" + (e + 10)], { words: true,
      remind: `Round ${money(p)} to $${Math.round(p)}, then multiply by ${n}.`,
      worked: ["3 items at $4.95 each.", "$4.95 is about $5.", "3 × $5 = $15."] });
  };

  G["money-problems"] = lv => {
    const p = rnd(2, lv ? 9 : 5), n = rnd(3, lv ? 9 : 6), paid = p * n <= 20 ? (p * n < 20 ? 20 : 50) : 50, cost = p * n;
    const t = pick([
      { q: `Pens cost $${p} each. Mia buys ${n} pens and pays with a $${paid} note. How much change does she get?`, a: paid - cost, why: `${n} × $${p} = $${cost}. Then $${paid} − $${cost} = $${paid - cost}.` },
      { q: `A movie ticket costs $${p + 10}. How much do ${n} tickets cost?`, a: (p + 10) * n, why: `${n} × $${p + 10} = $${(p + 10) * n}.` },
      { q: `${n} friends share a $${cost * 2} pizza bill equally. How much does each friend pay?`, a: cost * 2 / n, why: `$${cost * 2} ÷ ${n} = $${cost * 2 / n}.` }]);
    return { html: t.q, words: true, ans: t.a, ansText: "$" + t.a, remind: t.why,
      worked: ["2 drinks at $3 each, paid with $10.", "Spent: 2 × $3 = $6.", "Change: $10 − $6 = $4."] };
  };

  G["divisibility"] = lv => {
    const d = pick(lv === 0 ? [2, 5, 10] : [2, 3, 5, 10]);
    const yes = Math.random() < .5;
    let n; do { n = rnd(lv === 2 ? 1000 : 100, lv === 2 ? 9999 : 999); } while ((n % d === 0) !== yes);
    const digits = String(n).split("").map(Number), sum = digits.reduce((a, b) => a + b, 0);
    const why = d === 3 ? `Add the digits: ${digits.join(" + ")} = ${sum}. ${sum} ${sum % 3 ? "is not" : "is"} in the 3 times table.`
      : d === 2 ? `It ends in ${n % 10}, which ${n % 2 ? "is odd" : "is even"}.` : `It ends in ${n % 10}.`;
    return mc(`Use the rule: is ${fmt(n)} divisible by ${d}?`, yes ? "Yes" : "No", [yes ? "No" : "Yes"], { words: true, remind: why,
      worked: ["Is 312 divisible by 3?", "Add the digits: 3 + 1 + 2 = 6.", "6 is in the 3 times table, so yes."] });
  };

  G["inverse-facts"] = lv => {
    const a = rnd(3, lv ? 12 : 9), b = rnd(3, lv ? 12 : 9), c = a * b;
    const q = pick([
      { html: `${a} × ${b} = ${c}, so ${c} ÷ ${b} = ?`, ans: a },
      { html: `${a} × ${b} = ${c}, so ${c} ÷ ${a} = ?`, ans: b },
      { html: `${c} ÷ ${a} = ${b}, so ${b} × ${a} = ?`, ans: c }]);
    return Object.assign(q, { ansText: String(q.ans),
      remind: `${a} × ${b} = ${c} belongs to a fact family with ${c} ÷ ${a} = ${b} and ${c} ÷ ${b} = ${a}.`,
      worked: ["6 × 7 = 42.", "The fact family: 7 × 6 = 42, 42 ÷ 7 = 6, 42 ÷ 6 = 7.", "So 42 ÷ 7 = 6."] });
  };

  G["unknown-values"] = lv => {
    const a = rnd(3, lv ? 12 : 9), b = rnd(3, lv ? 12 : 9), c = a * b;
    const t = pick([
      { html: `□ × ${b} = ${c}`, ans: a, why: `□ = ${c} ÷ ${b} = ${a}.` },
      { html: `${a} × □ = ${c}`, ans: b, why: `□ = ${c} ÷ ${a} = ${b}.` },
      { html: `${c} ÷ □ = ${b}`, ans: a, why: `${c} divided by what makes ${b}? ${c} ÷ ${b} = ${a}.` },
      { html: `□ ÷ ${a} = ${b}`, ans: c, why: `Undo the division: □ = ${b} × ${a} = ${c}.` }]);
    return { html: `What number goes in the box? &nbsp; ${t.html}`, ans: t.ans, ansText: String(t.ans), remind: t.why,
      worked: ["□ × 8 = 56.", "Undo the × 8 by dividing: 56 ÷ 8 = 7.", "Check: 7 × 8 = 56 ✓."] };
  };

  G["metric-units"] = lv => {
    if (Math.random() < .45) {
      const [thing, unit, opts] = pick([["the mass of an apple", "g", ["kg", "mL", "km"]], ["the length of a pencil", "cm", ["km", "kg", "L"]],
        ["the distance from Melbourne to Sydney", "km", ["cm", "mm", "g"]], ["the capacity of a teaspoon", "mL", ["L", "kg", "m"]],
        ["the mass of a person", "kg", ["g", "mL", "km"]], ["the capacity of a bathtub", "L", ["mL", "g", "cm"]], ["the length of a classroom", "m", ["mm", "km", "kg"]]]);
      return mc(`Which unit is best for measuring ${thing}?`, unit, opts, { words: true,
        remind: "First decide: length (mm, cm, m, km), mass (g, kg) or capacity (mL, L)? Then pick the size that fits.",
        worked: ["Measuring a water bottle's capacity.", "Capacity uses mL or L.", "A bottle holds about 600 mL, so mL fits best."] });
    }
    const [big, small, k] = pick([["m", "cm", 100], ["km", "m", 1000], ["kg", "g", 1000], ["L", "mL", 1000], ["cm", "mm", 10]]);
    const v = lv === 0 ? rnd(2, 9) : rnd(11, 95) / 10;
    return { html: `${num(v)} ${big} = ? ${small}`, ans: +(v * k).toFixed(3), ansText: `${num(v * k)} ${small}`,
      remind: `1 ${big} = ${k} ${small}. Going to a smaller unit, multiply by ${k}.`,
      worked: ["2.5 kg = ? g", "1 kg = 1000 g.", "2.5 × 1000 = 2500 g."] };
  };

  G["perimeter-area"] = lv => {
    const [lo, hi] = lv === 0 ? [2, 6] : lv === 1 ? [3, 10] : [6, 15], l = rnd(lo, hi), w = rnd(lo, hi);
    if (Math.random() < .5) return { words: true, html: `A rectangle is ${l} cm long and ${w} cm wide. What is its area in cm²?`, ans: l * w, ansText: `${l * w} cm²`,
      remind: "Area of a rectangle = length × width. Multiply the two side lengths.", worked: ["A rectangle 7 cm by 5 cm.", "Area = 7 × 5 = 35.", "Answer: 35 cm²."] };
    return { words: true, html: `A rectangle is ${l} cm long and ${w} cm wide. What is its perimeter in cm?`, ans: 2 * (l + w), ansText: `${2 * (l + w)} cm`,
      remind: "Perimeter is the distance around. Add all four sides: length + width + length + width.", worked: ["A rectangle 7 cm by 5 cm.", "7 + 5 + 7 + 5 = 24.", "Answer: 24 cm."] };
  };

  G["time-24-hour"] = lv => {
    const h = rnd(1, 12), m = pick([0, 15, 20, 30, 45, 50]), pm = Math.random() < .6, mm = String(m).padStart(2, "0");
    const h24 = pm ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h), t24 = `${String(h24).padStart(2, "0")}:${mm}`;
    const wrong = [`${String((h24 + 12) % 24).padStart(2, "0")}:${mm}`, `${String((h24 + 2) % 24).padStart(2, "0")}:${mm}`, `${String(h).padStart(2, "0")}${pm ? "" : "1"}:${mm}`.slice(0, 5), `${String((h24 + 11) % 24).padStart(2, "0")}:${mm}`];
    if (Math.random() < .5 || lv === 0)
      return mc(`What is ${h}:${mm} ${pm ? "pm" : "am"} in 24-hour time?`, t24, wrong, { words: true,
        remind: pm ? "For pm times, add 12 to the hour (but 12 pm stays 12)." : "For am times, keep the hour (but 12 am becomes 00).",
        worked: ["3:45 pm in 24-hour time.", "It's pm, so add 12 to the hour: 3 + 12 = 15.", "Answer: 15:45."] });
    const t12 = `${h}:${mm} ${pm ? "pm" : "am"}`;
    return mc(`What is ${t24} in 12-hour time?`, t12, [`${h}:${mm} ${pm ? "am" : "pm"}`, `${h === 12 ? 1 : h + 1}:${mm} ${pm ? "pm" : "am"}`, `${h24}:${mm} ${pm ? "pm" : "am"}`], { words: true,
      remind: "If the hour is more than 12, take away 12 and it's pm. 00 is 12 am.",
      worked: ["17:20 in 12-hour time.", "17 is more than 12: 17 − 12 = 5.", "Answer: 5:20 pm."] });
  };

  G["angles"] = lv => {
    const kind = pick(["acute", "right", "obtuse", "straight", ...(lv ? ["reflex"] : [])]);
    const deg = { acute: rnd(25, 75), right: 90, obtuse: rnd(110, 160), straight: 180, reflex: rnd(210, 320) }[kind];
    if (lv === 2 && (kind === "acute" || kind === "obtuse")) {
      const est = Math.round(deg / 10) * 10;
      return mc(`Estimate the size of this angle.`, `about ${est}°`, [`about ${Math.abs(est - 50)}°`, `about ${est + 60}°`, `about ${Math.abs(180 - est) || 30}°`], { words: true, diagram: angleSVG(deg),
        remind: "Compare it with a right angle (90°) and a straight line (180°).", worked: ["An angle a bit smaller than a square corner.", "A square corner is 90°.", "So it's about 70° or 80°."] });
    }
    const names = { acute: "Acute", right: "Right angle", obtuse: "Obtuse", straight: "Straight", reflex: "Reflex" };
    return mc(`What type of angle is this?`, names[kind], Object.values(names).filter(n => n !== names[kind]), { words: true, diagram: angleSVG(deg),
      remind: "Acute is less than 90°. Right is exactly 90°. Obtuse is between 90° and 180°. Straight is 180°. Reflex is more than 180°.",
      worked: ["An angle wider than a square corner but not flat.", "Bigger than 90°, smaller than 180°.", "That's obtuse."] });
  };

  G["nets"] = lv => {
    const [net, solid] = pick([["6 squares", "Cube"], ["1 square and 4 triangles", "Square pyramid"], ["2 triangles and 3 rectangles", "Triangular prism"],
      ["2 circles and 1 rectangle", "Cylinder"], ["6 rectangles", "Rectangular prism"], ["4 triangles", "Triangular pyramid"]]);
    return mc(`A net is made of ${net}. Which 3D object does it fold into?`, solid,
      ["Cube", "Square pyramid", "Triangular prism", "Cylinder", "Rectangular prism", "Triangular pyramid", "Cone"].filter(x => x !== solid).sort(() => Math.random() - .5), { words: true,
      remind: "Each shape in the net becomes one face. Match the faces to the object.",
      worked: ["A net of 1 square and 4 triangles.", "The square is the base; the 4 triangles meet at the top.", "That's a square pyramid."] });
  };

  G["coordinates"] = lv => {
    let x = rnd(1, 5), y = rnd(1, 5); if (x === y) y = (y % 5) + 1;
    return mc(`What are the coordinates of the blue dot?`, `(${x}, ${y})`, [`(${y}, ${x})`, `(${x + 1}, ${y})`, `(${x}, ${y - 1 || y + 1})`], { words: true, diagram: gridSVG(x, y),
      remind: "Go across the bottom first to find the first number, then up the side for the second.",
      worked: ["A dot 3 across and 2 up.", "Across first: 3. Then up: 2.", "So it's (3, 2)."] });
  };

  G["transformations"] = lv => {
    const kind = pick(["translation", "reflection", "rotation"]);
    const name = { translation: "Translation (slide)", reflection: "Reflection (flip)", rotation: "Rotation (turn)" };
    return mc(`Which transformation moved the blue shape to the yellow shape?`, name[kind], Object.values(name).filter(n => n !== name[kind]), { words: true, diagram: transformSVG(kind),
      remind: "Same direction → slide. Mirror image → flip. Turned around → turn.",
      worked: ["The shape looks like its mirror image.", "It's been flipped over a line.", "That's a reflection."] });
  };

  G["data-types"] = lv => {
    const [q, t] = pick([["favourite colour", "Categorical"], ["number of pets", "Numerical"], ["type of pet", "Categorical"], ["height in cm", "Numerical"],
      ["T-shirt size (S, M, L)", "Categorical (ordinal)"], ["number of siblings", "Numerical"], ["favourite sport", "Categorical"], ["how often you read (never, sometimes, always)", "Categorical (ordinal)"]]);
    return mc(`A survey asks for each student's ${q}. What type of data is this?`, t, ["Categorical", "Numerical", "Categorical (ordinal)"].filter(x => x !== t), { words: true,
      remind: "Names or groups → categorical. Groups with an order → ordinal. Counts or measurements → numerical.",
      worked: ["A survey asks 'how many books did you read?'", "The answers are numbers you count.", "So it's numerical data."] });
  };

  G["line-graph"] = lv => {
    const labels = ["6am", "9am", "12pm", "3pm", "6pm", "9pm"];
    const base = rnd(10, 16), vals = [0, 4, 8, 10, 6, 2].map((d, i) => base + d + rnd(-1, 1));
    if (Math.random() < .5) {
      const i = rnd(0, 5);
      return { html: `What was the temperature at ${labels[i]}?`, words: true, diagram: lineGraphSVG(vals, labels), ans: vals[i], ansText: `${vals[i]}°C`,
        remind: "Find the time on the bottom, go straight up to the line, then across to the side to read the number.",
        worked: ["Find 3pm on the bottom.", "Go up to the dot on the line.", "Go across to the side and read the temperature."] };
    }
    const iMax = vals.indexOf(Math.max(...vals));
    return mc(`At what time was it warmest?`, labels[iMax], labels.filter((_, i) => i !== iMax), { words: true, diagram: lineGraphSVG(vals, labels),
      remind: "The warmest time is the highest point on the line.", worked: ["Look for the highest dot on the line.", "Go straight down to the time axis.", "That's when it was warmest."] });
  };

  G["investigations"] = lv => {
    const [q, a, w] = pick([
      ["Which display is best for showing how temperature changes over a day?", "Line graph", ["Bar chart", "Tally", "Pictograph"]],
      ["Which display is best for comparing the favourite fruits of a class?", "Bar chart", ["Line graph", "A single number", "Coordinate grid"]],
      ["What is the first step of a statistical investigation?", "Pose a question", ["Draw a graph", "Write a report", "Find the average"]],
      ["After collecting data, what should you do next?", "Organise and display it", ["Ask the question", "Throw away odd results", "Stop"]],
      ["Which is the best survey question?", "What is your favourite sport?", ["Sport?", "Don't you agree soccer is best?", "Do you like things?"]],
      ["What is the last step of a statistical investigation?", "Interpret and report the results", ["Pose a question", "Collect data", "Draw a table"]]]);
    return mc(q, a, w, { words: true, remind: "Investigations go: pose a question → collect data → display it → interpret and report.",
      worked: ["You want to know the class's favourite pet.", "Ask, collect answers, show them in a bar chart.", "Then say which pet won and by how much."] });
  };

  G["chance"] = lv => {
    const t = pick([
      () => mc("Rolling a fair die: is getting a 6 as likely as getting a 1?", "Yes, equally likely", ["No, 6 is less likely", "No, 1 is less likely"], { remind: "A fair die has 6 faces, each with the same chance." }),
      () => { const r = rnd(2, 4), b = rnd(1, 2); return mc(`A spinner has ${r} red parts and ${b} blue part${b > 1 ? "s" : ""}, all the same size. Are red and blue equally likely?`, "No, red is more likely", ["Yes, equally likely", "No, blue is more likely"], { remind: `Red has ${r} parts and blue has ${b}, so red has more chances.` }); },
      () => { const n = pick([2, 4, 6, 8]); return { html: `A spinner has ${n} equal parts, numbered 1 to ${n}. How many possible outcomes are there?`, ans: n, ansText: String(n), remind: "Each part is one outcome. Count the parts." }; },
      () => mc("Flipping a fair coin: which is true?", "Heads and tails are equally likely", ["Heads is more likely", "Tails is more likely"], { remind: "A fair coin has 2 sides with the same chance." })]);
    return Object.assign(t(), { words: true, worked: ["A spinner with 4 equal parts: red, red, blue, green.", "Red covers 2 parts, blue and green 1 each.", "Red is more likely; blue and green are equally likely."] });
  };

  G["experiments"] = lv => {
    const total = pick([20, 30, 40, 50]), h = rnd(Math.floor(total * .35), Math.floor(total * .65));
    if (Math.random() < .5)
      return { html: `A coin was flipped ${total} times and landed on heads ${h} times. How many times did it land on tails?`, words: true, ans: total - h, ansText: String(total - h),
        remind: `Heads + tails = ${total}. So tails = ${total} − ${h}.`, worked: ["20 flips, 12 heads.", "Tails = 20 − 12.", "That's 8 tails."] };
    const a = rnd(3, 9), b = rnd(3, 9), c = rnd(3, 9), d = rnd(3, 9), arr = [a, b, c, d], cols = ["Red", "Blue", "Green", "Yellow"];
    const mx = Math.max(...arr); if (arr.filter(x => x === mx).length > 1) arr[arr.indexOf(mx)]++;
    const top = cols[arr.indexOf(Math.max(...arr))];
    return mc(`A spinner was spun ${arr.reduce((p, q) => p + q, 0)} times. Which colour had the highest frequency?`, top, cols.filter(x => x !== top), { words: true,
      extra: `<table class="pv" style="margin-top:8px"><tr>${cols.map(c => `<th>${c}</th>`).join("")}</tr><tr>${arr.map(n => `<td>${n}</td>`).join("")}</tr></table>`,
      remind: "Frequency is how many times it happened. Find the biggest number in the table.", worked: ["Results: Red 5, Blue 8, Green 4.", "The biggest number is 8.", "So Blue had the highest frequency."] });
  };

  G["decimal-multiply-power-of-10"] = lv => {
    const m = lv === 0 ? 10 : lv === 1 ? pick([10, 100]) : pick([100, 1000]);
    const xi = lv === 0 ? rnd(11, 99) * 10 : rnd(101, 999), x = xi / 100, ans = xi * m / 100, p = String(m).length - 1;
    return { html: `${num(x)} × ${m} = ?`, ans, ansText: num(ans),
      remind: `${m} has ${p} zero${p > 1 ? "s" : ""}, so every digit moves ${p} place${p > 1 ? "s" : ""} to the left. Fill empty places with zeros.`,
      worked: ["Look at 4.7 × 100.", "100 has 2 zeros, so move 2 places.", "4.7 → 47 → 470."] };
  };

  window.GENERATORS = G;
})();
