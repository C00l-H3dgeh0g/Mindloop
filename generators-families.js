/* MindLoop question families: reusable generators set up by each lesson's "params".
   Signature: (level 0|1|2, params, lesson) → question (same shape as generators.js).
   A "tol" field allows rounding wiggle room for decimal answers. */
(function () {
  const G = window.GENERATORS;
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
  const fr = (n, d) => `<span class="fr"><span>${n}</span><span>${d}</span></span>`;
  const num = x => String(+(+x).toFixed(3));
  const fmt = n => (+n).toLocaleString("en-AU", { maximumFractionDigits: 3 });
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const R = (lv, arr) => arr[Math.min(lv, arr.length - 1)];          // pick a per-level setting
  const rr = r => rnd(r[0], r[1]);
  const round1 = x => Math.round(x * 10) / 10;
  const svg = (w, h, body, label) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" style="max-width:100%;height:auto" role="img" aria-label="${label}" fill="none" stroke="currentColor">${body}</svg>`;
  const T = (x, y, t, s = 12, a = "middle") => `<text x="${x}" y="${y}" text-anchor="${a}" fill="currentColor" stroke="none" font-size="${s}">${t}</text>`;
  function mc(q, correct, wrong, rest) {
    const seen = new Set([String(correct)]);
    const ws = shuffle(wrong).filter(w => { const k = String(w); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 3);
    const choices = shuffle([correct, ...ws].map(String));
    return Object.assign({ html: q, choices, ans: choices.indexOf(String(correct)), ansText: String(correct) }, rest);
  }
  const fracText = (n, d) => { const g = gcd(n, d); return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`; };
  const EMOJI = ["🍎", "⭐", "🐟", "🚗", "🌸", "🐞", "⚽", "🧁"];
  const group = (n, e) => `<div style="font-size:1.8rem;line-height:1.4;max-width:340px;letter-spacing:4px">${e.repeat(n)}</div>`;
  const W = (lesson, fallback) => (lesson && lesson.worked) || fallback;

  /* ---------- question bank (concept topics) ----------
     lesson.bank: [ [question, correct, [wrong...], remind?, diagramKey?], ... ] */
  G["bank"] = (lv, P, lesson) => {
    const item = pick(lesson.bank);
    const [q, a, w, remind] = item;
    return mc(q, a, w, { words: true, remind: remind || lesson.hint, worked: W(lesson, ["Read the question carefully.", "Think about what you learned in the lesson.", "Pick the answer that fits best."]) });
  };

  /* ---------- early number ---------- */
  G["count"] = (lv, P, lesson) => {
    const n = rnd(1, R(lv, P.max || [5, 10, 20])), e = pick(EMOJI);
    return { html: `How many ${e} are there?`, words: true, extra: group(n, e), ans: n, ansText: String(n),
      remind: "Point to each one and count. Say one number for each object, and don't count any twice.",
      worked: W(lesson, ["Look at 🍎🍎🍎🍎.", "Touch each apple: 1, 2, 3, 4.", "The last number is how many: 4."]) };
  };
  G["compare-groups"] = (lv, P, lesson) => {
    const max = R(lv, P.max || [5, 10, 20]);
    let a = rnd(1, max), b = rnd(1, max); while (a === b) b = rnd(1, max);
    const e1 = pick(EMOJI), e2 = pick(EMOJI.filter(x => x !== e1));
    return mc(`Which group has more?`, a > b ? `The ${e1} group` : `The ${e2} group`, [a > b ? `The ${e2} group` : `The ${e1} group`, "They're the same"], { words: true,
      extra: `<div class="stack" style="gap:6px">${group(a, e1)}${group(b, e2)}</div>`,
      remind: "Count each group. The bigger number is the group with more.",
      worked: W(lesson, ["Group A has 6, group B has 4.", "6 is more than 4.", "So group A has more."]) });
  };
  G["number-order"] = (lv, P, lesson) => {
    const max = R(lv, P.max || [20, 120, 1000]), n = rnd(2, max - 2), step = P.step || 1;
    const t = pick(["after", "before", "between"]);
    if (t === "after") return { html: `What number comes just after ${fmt(n)}?`, words: true, ans: n + step, ansText: fmt(n + step), remind: "The number after is 1 more.", worked: W(lesson, ["What comes after 39?", "Count on one: 39, 40.", "So 40."]) };
    if (t === "before") return { html: `What number comes just before ${fmt(n)}?`, words: true, ans: n - step, ansText: fmt(n - step), remind: "The number before is 1 less.", worked: W(lesson, ["What comes before 40?", "Count back one: 40, 39.", "So 39."]) };
    return { html: `What number is between ${fmt(n - 1)} and ${fmt(n + 1)}?`, words: true, ans: n, ansText: fmt(n), remind: "Count from the first number to the second. The one in the middle is the answer.", worked: W(lesson, ["Between 17 and 19?", "17, 18, 19.", "So 18."]) };
  };
  G["compare-numbers"] = (lv, P, lesson) => {
    const max = R(lv, P.max || [20, 100, 1000]);
    let a = rnd(0, max), b = rnd(0, max); while (a === b) b = rnd(0, max);
    return mc(`Which number is bigger: ${fmt(a)} or ${fmt(b)}?`, fmt(Math.max(a, b)), [fmt(Math.min(a, b))], { words: true,
      remind: "Compare the biggest place first: hundreds, then tens, then ones.",
      worked: W(lesson, ["Compare 47 and 52.", "Tens: 4 tens and 5 tens.", "5 tens is more, so 52 is bigger."]) });
  };
  G["bonds"] = (lv, P, lesson) => {
    const total = R(lv, P.total || [5, 10, 20]), a = rnd(0, total);
    return { html: `${a} + □ = ${total}`, ans: total - a, ansText: String(total - a),
      remind: `What do you add to ${a} to make ${total}? Count on from ${a} to ${total}.`,
      worked: W(lesson, ["3 + □ = 10.", "Count on from 3: 4, 5, 6, 7, 8, 9, 10. That's 7 jumps.", "So □ = 7."]) };
  };
  G["partition"] = (lv, P, lesson) => {
    const n = rnd(R(lv, [11, 21, 101]), R(lv, [99, 99, 999])), h = Math.floor(n / 100), t = Math.floor(n / 10) % 10, o = n % 10;
    const q = pick(n >= 100 ? ["h", "t", "o"] : ["t", "o"]);
    const ask = { h: [`How many hundreds are in ${n}?`, h], t: [`How many tens are in ${n}? (Just the tens digit.)`, t], o: [`How many ones are in ${n}?`, o] }[q];
    return { html: ask[0], words: true, ans: ask[1], ansText: String(ask[1]),
      remind: `${n} = ${h ? h + " hundreds, " : ""}${t} tens and ${o} ones.`,
      worked: W(lesson, ["Look at 47.", "47 = 40 + 7.", "So 4 tens and 7 ones."]) };
  };
  G["place-value"] = (lv, P, lesson) => {
    const digits = R(lv, P.digits || [3, 4, 5]);
    let n = rnd(10 ** (digits - 1), 10 ** digits - 1), s = String(n), i = rnd(0, s.length - 1);
    while (s[i] === "0") { n = rnd(10 ** (digits - 1), 10 ** digits - 1); s = String(n); i = rnd(0, s.length - 1); }
    const val = +s[i] * 10 ** (s.length - 1 - i);
    return { html: `What is the value of the digit ${s[i]} in ${fmt(n)}?`, words: true, ans: val, ansText: fmt(val),
      remind: "Find the digit's place (ones, tens, hundreds, thousands…). Its value is the digit times that place.",
      worked: W(lesson, ["The 6 in 3,642.", "The 6 is in the hundreds place.", "So its value is 600."]) };
  };
  G["skip-count"] = (lv, P, lesson) => {
    const step = pick(R(lv, P.steps || [[2, 5, 10], [2, 3, 5, 10], [3, 4, 25, 50]])), down = (P.down && Math.random() < .35);
    const start = step * rnd(0, 10) + (P.offset ? rnd(0, step - 1) : 0), seq = [0, 1, 2, 3].map(i => down ? start + step * (8 - i) : start + step * i);
    const next = down ? seq[3] - step : seq[3] + step;
    return { html: `What comes next? &nbsp; ${seq.join(", ")}, □`, ans: next, ansText: String(next),
      remind: `The numbers ${down ? "go down" : "go up"} by ${step} each time.`,
      worked: W(lesson, ["5, 10, 15, 20, □", "Each number is 5 more than the one before.", "20 + 5 = 25."]) };
  };
  G["repeat-pattern"] = (lv, P, lesson) => {
    const unit = shuffle(["🔴", "🔵", "🟡", "🟢", "⭐", "🔺"]).slice(0, R(lv, [2, 3, 3])), len = unit.length;
    const shown = rnd(len * 2, len * 3), seq = Array.from({ length: shown }, (_, i) => unit[i % len]), next = unit[shown % len];
    return mc(`What comes next in the pattern?`, next, unit.filter(x => x !== next).concat(["⬛"]), { words: true,
      extra: `<div style="font-size:1.8rem;letter-spacing:6px">${seq.join("")} ❓</div>`,
      remind: "Find the part that repeats, then keep going.",
      worked: W(lesson, ["🔴🔵🔴🔵🔴 ❓", "The repeating part is 🔴🔵.", "After 🔴 comes 🔵."]) });
  };
  G["add-sub"] = (lv, P, lesson) => {
    const max = R(lv, P.max || [10, 20, 100]), op = pick(P.ops || ["+", "−"]);
    let a = rnd(0, max), b = rnd(0, max);
    if (op === "+") { if (a + b > (P.sumMax ? R(lv, P.sumMax) : max * 2)) b = Math.max(0, max - a); }
    else if (b > a) [a, b] = [b, a];
    const ans = op === "+" ? a + b : a - b, missing = P.missing && Math.random() < .35;
    if (missing) return { html: op === "+" ? `${fmt(a)} + □ = ${fmt(ans)}` : `${fmt(a)} − □ = ${fmt(ans)}`, ans: b, ansText: fmt(b),
      remind: op === "+" ? `Count on from ${a} to ${ans}, or do ${ans} − ${a}.` : `${a} − ${ans} gives the missing number.`, worked: W(lesson, ["8 + □ = 13.", "13 − 8 = 5.", "So □ = 5."]) };
    return { html: `${fmt(a)} ${op} ${fmt(b)} = ?`, ans, ansText: fmt(ans),
      remind: op === "+" ? "Add the ones, then the tens, then the hundreds. Carry if a column goes over 9." : "Take away the ones, then the tens, then the hundreds. Trade a ten if you need to.",
      worked: W(lesson, op === "+" ? ["37 + 25.", "30 + 20 = 50 and 7 + 5 = 12.", "50 + 12 = 62."] : ["52 − 17.", "52 − 10 = 42.", "42 − 7 = 35."]) };
  };
  G["mult-facts"] = (lv, P, lesson) => {
    const t = pick(R(lv, P.tables || [[2], [2, 5, 10], [2, 3, 4, 5, 10]])), k = rnd(0, P.upTo || 10), div = P.div !== false && Math.random() < .4;
    if (div && k > 0) return { html: `${t * k} ÷ ${t} = ?`, ans: k, ansText: String(k), remind: `Think: ? × ${t} = ${t * k}.`, worked: W(lesson, ["20 ÷ 5 = ?", "What times 5 makes 20? 4 × 5 = 20.", "So 20 ÷ 5 = 4."]) };
    return { html: `${k} × ${t} = ?`, ans: k * t, ansText: String(k * t), remind: `Count in ${t}s, ${k} times.`, worked: W(lesson, ["4 × 5 = ?", "Count in fives: 5, 10, 15, 20.", "So 4 × 5 = 20."]) };
  };
  G["arrays"] = (lv, P, lesson) => {
    const r = rnd(2, R(lv, [4, 6, 9])), c = rnd(2, R(lv, [5, 8, 10]));
    const dots = Array.from({ length: r }, () => "●".repeat(c)).join("<br>");
    return { html: `How many dots are in this array?`, words: true, extra: `<div style="font-size:1.4rem;line-height:1.2;letter-spacing:6px;color:var(--biro)">${dots}</div>`, ans: r * c, ansText: String(r * c),
      remind: `There are ${r} rows with ${c} in each row. Rows × columns.`, worked: W(lesson, ["3 rows of 4 dots.", "3 × 4 = 12.", "12 dots."]) };
  };
  G["share"] = (lv, P, lesson) => {
    const g = rnd(2, R(lv, [3, 5, 10])), each = rnd(1, R(lv, [5, 6, 12])), total = g * each, thing = pick(["apples", "stickers", "pencils", "cookies", "marbles"]);
    if (Math.random() < .5) return { html: `${total} ${thing} are shared equally between ${g} friends. How many does each friend get?`, words: true, ans: each, ansText: String(each),
      remind: `Share them out one at a time, or think: ${g} × ? = ${total}.`, worked: W(lesson, ["12 cookies shared by 3 friends.", "Give one each until they run out: each gets 4.", "Check: 3 × 4 = 12."]) };
    return { html: `${total} ${thing} are put into groups of ${each}. How many groups are there?`, words: true, ans: g, ansText: String(g),
      remind: `How many lots of ${each} fit into ${total}?`, worked: W(lesson, ["12 cookies in groups of 4.", "4, 8, 12: that's 3 groups.", "So 3 groups."]) };
  };
  G["money"] = (lv, P, lesson) => {
    const coins = R(lv, P.coins || [[5, 10, 20], [5, 10, 20, 50, 100], [10, 20, 50, 100, 200]]);
    const pickC = Array.from({ length: rnd(2, R(lv, [3, 4, 5])) }, () => pick(coins)), tot = pickC.reduce((a, b) => a + b, 0);
    const lab = c => c >= 100 ? `$${c / 100}` : `${c}c`;
    const show = tot >= 100 ? `$${(tot / 100).toFixed(2)}` : `${tot}c`;
    return { html: `How much money is this, in cents?`, words: true, extra: `<div class="row">${pickC.map(c => `<span class="pill mark" style="font-size:1rem;padding:8px 12px">${lab(c)}</span>`).join("")}</div>`, ans: tot, ansText: `${tot}c (${show})`,
      remind: "Start with the biggest coin and count on. $1 = 100c and $2 = 200c.", worked: W(lesson, ["50c, 20c, 20c, 5c.", "50 + 20 + 20 = 90, then 90 + 5 = 95.", "95c."]) };
  };
  G["fraction-shade"] = (lv, P, lesson) => {
    const d = pick(R(lv, P.dens || [[2, 4], [2, 3, 4, 8], [3, 5, 6, 8, 10]])), n = rnd(1, d - 1), w = 300 / d;
    const parts = Array.from({ length: d }, (_, i) => `<rect x="${i * w + 2}" y="2" width="${w - 4}" height="56" rx="6" ${i < n ? 'fill="#2D57CC" stroke="#2D57CC"' : 'stroke-opacity=".5"'} stroke-width="2"/>`).join("");
    const opts = [`${n}/${d}`, `${d - n}/${d}`, `${n}/${d + 1}`, `${d}/${n}`, `1/${d}`].filter(x => x !== `${n}/${d}`);
    const v = s => { const [a, b] = s.split("/"); return fr(a, b); };
    const q = mc(`What fraction is shaded?`, `${n}/${d}`, opts, { words: true, diagram: svg(304, 60, parts, "A bar split into equal parts"),
      remind: "Count the equal parts (bottom number) and the shaded parts (top number).", worked: W(lesson, ["A bar in 4 equal parts, 3 shaded.", "4 parts altogether: bottom number 4.", "3 shaded: 3/4."]) });
    q.choices = q.choices.map(v); return q;
  };
  G["fraction-of"] = (lv, P, lesson) => {
    const d = pick(R(lv, P.dens || [[2, 4], [2, 3, 4, 5, 10], [3, 4, 5, 8, 10]])), n = P.unit ? 1 : rnd(1, d - 1), k = rnd(1, R(lv, [5, 10, 12])), total = d * k;
    return { html: `What is ${fr(n, d)} of ${total}?`, ans: n * k, ansText: String(n * k),
      remind: `Divide ${total} by ${d} to find one part (${k}), then multiply by ${n}.`, worked: W(lesson, ["3/4 of 20.", "20 ÷ 4 = 5, so one quarter is 5.", "3 × 5 = 15."]) };
  };
  G["round"] = (lv, P, lesson) => {
    const to = pick(R(lv, P.to || [[10], [10, 100], [100, 1000]])), n = rnd(to + 1, to * 99);
    if (n % to === to / 2) return G["round"](lv, P, lesson);
    const r = Math.round(n / to) * to;
    return { html: `Round ${fmt(n)} to the nearest ${fmt(to)}.`, words: true, ans: r, ansText: fmt(r),
      remind: `Look at the digit to the right of the ${fmt(to)}s place. 5 or more rounds up; 4 or less rounds down.`, worked: W(lesson, ["Round 347 to the nearest 10.", "The ones digit is 7, which is 5 or more.", "Round up to 350."]) };
  };
  G["clock"] = (lv, P, lesson) => {
    const h = rnd(1, 12), m = pick(R(lv, P.mins || [[0, 30], [0, 15, 30, 45], [0, 5, 10, 20, 25, 35, 40, 50, 55]]));
    const ha = ((h % 12) + m / 60) * 30 - 90, ma = m * 6 - 90, c = 80, rad = a => a * Math.PI / 180;
    let face = `<circle cx="${c}" cy="${c}" r="72" stroke-width="3"/>`;
    for (let i = 1; i <= 12; i++) face += T(c + 58 * Math.cos(rad(i * 30 - 90)), c + 58 * Math.sin(rad(i * 30 - 90)) + 5, i, 14);
    face += `<line x1="${c}" y1="${c}" x2="${c + 36 * Math.cos(rad(ha))}" y2="${c + 36 * Math.sin(rad(ha))}" stroke-width="6" stroke-linecap="round"/>`;
    face += `<line x1="${c}" y1="${c}" x2="${c + 54 * Math.cos(rad(ma))}" y2="${c + 54 * Math.sin(rad(ma))}" stroke-width="3" stroke="#2D57CC" stroke-linecap="round"/><circle cx="${c}" cy="${c}" r="4" fill="currentColor"/>`;
    const name = (H, M) => M === 0 ? `${H} o'clock` : M === 30 ? `half past ${H}` : M === 15 ? `quarter past ${H}` : M === 45 ? `quarter to ${H % 12 + 1}` : `${H}:${String(M).padStart(2, "0")}`;
    const right = name(h, m), wrong = [name(h % 12 + 1, m), name(h, (m + 30) % 60), name(m ? Math.round(m / 5) || 12 : h % 12 + 1, (h * 5) % 60)];
    return mc(`What time does the clock show?`, right, wrong, { words: true, diagram: svg(160, 160, face, "An analog clock"),
      remind: "The short hand shows the hour. The long blue hand shows the minutes: each number is 5 minutes.", worked: W(lesson, ["Short hand just past 3, long hand on 6.", "Long hand on 6 = 30 minutes.", "Half past 3."]) });
  };
  G["elapsed-time"] = (lv, P, lesson) => {
    const sh = rnd(7, 15), sm = pick([0, 15, 30, 45]), dur = pick(R(lv, [[30, 60, 90], [15, 45, 75, 105, 120], [25, 50, 85, 135, 170]]));
    const end = sh * 60 + sm + dur, f = t => `${((Math.floor(t / 60) - 1) % 12) + 1}:${String(t % 60).padStart(2, "0")}`;
    return { html: `A movie starts at ${f(sh * 60 + sm)} and finishes at ${f(end)}. How many minutes long is it?`, words: true, ans: dur, ansText: `${dur} minutes`,
      remind: "Count on from the start time to the next hour, then to the end time, and add the jumps.", worked: W(lesson, ["Starts 2:40, ends 4:10.", "2:40 → 3:00 is 20 min, 3:00 → 4:00 is 60, 4:00 → 4:10 is 10.", "20 + 60 + 10 = 90 minutes."]) };
  };
  G["calendar"] = (lv, P, lesson) => {
    const months = [["January", 31], ["March", 31], ["April", 30], ["June", 30], ["August", 31], ["October", 31]];
    const [mo] = pick(months), a = rnd(1, 15), b = rnd(a + 2, 28);
    return { html: `How many days are there from ${a} ${mo} to ${b} ${mo}?`, words: true, ans: b - a, ansText: `${b - a} days`,
      remind: "Subtract the first date from the second date.", worked: W(lesson, ["From 3 May to 10 May.", "10 − 3 = 7.", "7 days."]) };
  };
  G["unit-convert"] = (lv, P, lesson) => {
    const pairs = P.pairs || [["m", "cm", 100], ["km", "m", 1000], ["kg", "g", 1000], ["L", "mL", 1000], ["cm", "mm", 10]];
    const [big, small, k] = pick(pairs), v = lv === 0 ? rnd(2, 9) : lv === 1 ? rnd(11, 95) / 10 : rnd(101, 999) / 100;
    if (Math.random() < .5) return { html: `${num(v)} ${big} = ? ${small}`, ans: +(v * k).toFixed(3), ansText: `${num(v * k)} ${small}`, remind: `1 ${big} = ${k} ${small}. To a smaller unit, multiply by ${k}.`, worked: W(lesson, ["2.5 kg = ? g", "1 kg = 1000 g.", "2.5 × 1000 = 2500 g."]) };
    const s = Math.round(v * k);
    return { html: `${fmt(s)} ${small} = ? ${big}`, ans: s / k, ansText: `${num(s / k)} ${big}`, remind: `1 ${big} = ${k} ${small}. To a bigger unit, divide by ${k}.`, worked: W(lesson, ["3500 m = ? km", "1 km = 1000 m.", "3500 ÷ 1000 = 3.5 km."]) };
  };

  /* ---------- number, upper primary & secondary ---------- */
  G["arith"] = (lv, P, lesson) => {
    const op = pick(P.ops || ["×"]), [ra, rb] = R(lv, P.ranges);
    let a = rr(ra), b = rr(rb), ans, txt;
    if (op === "+") ans = a + b; if (op === "−") { if (b > a && !P.neg) [a, b] = [b, a]; ans = a - b; }
    if (op === "×") ans = a * b; if (op === "÷") { ans = a; a = a * b; }
    return { html: `${fmt(a)} ${op} ${fmt(b)} = ?`, ans, ansText: fmt(ans),
      remind: P.remind || { "+": "Add place by place, carrying when needed.", "−": "Subtract place by place, trading when needed.", "×": "Split one number into parts, multiply each part, then add.", "÷": "Think of the times table: what times the divisor makes this number?" }[op],
      worked: W(lesson, ["Look at 34 × 6.", "30 × 6 = 180 and 4 × 6 = 24.", "180 + 24 = 204."]) };
  };
  G["decimal-ops"] = (lv, P, lesson) => {
    const op = pick(P.ops || ["+", "−"]), dp = R(lv, [1, 2, 2]);
    let a = rnd(10, 999) / 10 ** dp, b = rnd(10, 999) / 10 ** dp, ans;
    if (op === "+") ans = a + b; if (op === "−") { if (b > a) [a, b] = [b, a]; ans = a - b; }
    if (op === "×") { b = rnd(2, 9); ans = a * b; } if (op === "÷") { b = rnd(2, 9); ans = round1(rnd(11, 99) / 10); a = +(ans * b).toFixed(2); }
    return { html: `${num(a)} ${op} ${num(b)} = ?`, ans: +ans.toFixed(4), ansText: num(ans),
      remind: op === "+" || op === "−" ? "Line up the decimal points, then add or subtract like whole numbers." : op === "×" ? "Multiply as if there's no decimal point, then put it back with the same number of decimal places." : "Divide as normal, keeping the decimal point lined up.",
      worked: W(lesson, ["3.45 + 2.7", "Line up: 3.45 + 2.70.", "= 6.15"]) };
  };
  G["fraction-ops"] = (lv, P, lesson) => {
    const kind = pick(P.kinds || ["add-related"]);
    let a, b, c, d, n, m, q;
    if (kind === "add-related" || kind === "sub-related") {
      b = pick([2, 3, 4, 5]); d = b * pick([2, 3]); a = rnd(1, b - 1); c = rnd(1, d - 1);
      if (kind === "sub-related" && a / b < c / d) { const t = a * (d / b); c = rnd(1, Math.max(1, t - 1)); if (c >= t) c = t - 1 || 1; }
      const A = a * (d / b); n = kind === "add-related" ? A + c : A - c; m = d;
      q = `${fr(a, b)} ${kind === "add-related" ? "+" : "−"} ${fr(c, d)} = ?`;
      return { html: q, ans: n / m, ansText: fracText(n, m), remind: `Change ${a}/${b} into ${d}ths (${A}/${d}), then ${kind === "add-related" ? "add" : "subtract"} the tops.`, worked: W(lesson, ["1/4 + 3/8.", "1/4 = 2/8.", "2/8 + 3/8 = 5/8."]) };
    }
    if (kind === "add-unlike" || kind === "sub-unlike") {
      b = rnd(2, 7); d = rnd(2, 7); while (d === b) d = rnd(2, 7); a = rnd(1, b - 1); c = rnd(1, d - 1);
      const sub = kind === "sub-unlike"; if (sub && a / b < c / d) [a, b, c, d] = [c, d, a, b];
      n = sub ? a * d - c * b : a * d + c * b; m = b * d;
      return { html: `${fr(a, b)} ${sub ? "−" : "+"} ${fr(c, d)} = ?`, ans: n / m, ansText: fracText(n, m), remind: `Use a common denominator: ${b} × ${d} = ${m}. Convert both fractions, then ${sub ? "subtract" : "add"} the tops.`, worked: W(lesson, ["1/3 + 1/4.", "Common denominator 12: 4/12 + 3/12.", "= 7/12."]) };
    }
    if (kind === "multiply") {
      a = rnd(1, 5); b = rnd(a + 1, 9); c = rnd(1, 5); d = rnd(c + 1, 9);
      return { html: `${fr(a, b)} × ${fr(c, d)} = ?`, ans: a * c / (b * d), ansText: fracText(a * c, b * d), remind: "Multiply the tops together and the bottoms together, then simplify.", worked: W(lesson, ["2/3 × 3/4.", "Tops: 2 × 3 = 6. Bottoms: 3 × 4 = 12.", "6/12 = 1/2."]) };
    }
    if (kind === "divide") {
      a = rnd(1, 5); b = rnd(a + 1, 9); c = rnd(1, 5); d = rnd(c + 1, 9);
      return { html: `${fr(a, b)} ÷ ${fr(c, d)} = ?`, ans: (a * d) / (b * c), ansText: fracText(a * d, b * c), remind: "Keep the first fraction, change ÷ to ×, and flip the second fraction.", worked: W(lesson, ["1/2 ÷ 3/4.", "1/2 × 4/3.", "= 4/6 = 2/3."]) };
    }
    if (kind === "whole-times") {
      a = rnd(1, 4); b = rnd(a + 1, 8); const w = rnd(2, 9);
      return { html: `${w} × ${fr(a, b)} = ?`, ans: w * a / b, ansText: fracText(w * a, b), remind: `Multiply the top by ${w}: ${w} × ${a} = ${w * a}. Keep the bottom.`, worked: W(lesson, ["3 × 2/5.", "3 × 2 = 6, so 6/5.", "= 1 1/5."]) };
    }
    if (kind === "simplify") {
      a = rnd(1, 7); b = rnd(a + 1, 9); while (gcd(a, b) !== 1) b++; const k = rnd(2, 6);
      return mc(`Simplify ${fr(a * k, b * k)}`, `${a}/${b}`, [`${a * k}/${b}`, `${a}/${b * k}`, `${a + 1}/${b}`, `${a * 2}/${b * 3}`], { remind: `Divide the top and bottom by ${k}.`, worked: W(lesson, ["Simplify 6/8.", "Both divide by 2.", "6/8 = 3/4."]) });
    }
    if (kind === "equivalent") {
      a = rnd(1, 5); b = rnd(a + 1, 8); const k = rnd(2, 6);
      return { html: `${fr(a, b)} = ${fr("□", b * k)}`, ans: a * k, ansText: String(a * k), remind: `The bottom was multiplied by ${k}, so multiply the top by ${k} too.`, worked: W(lesson, ["2/3 = □/12.", "3 × 4 = 12, so multiply the top by 4.", "□ = 8."]) };
    }
    // mixed → improper
    const w = rnd(1, 4); b = rnd(2, 8); a = rnd(1, b - 1);
    return { html: `Write ${w}${fr(a, b)} as an improper fraction. What is the top number?`, words: true, ans: w * b + a, ansText: `${w * b + a}/${b}`, remind: `Whole number × bottom + top: ${w} × ${b} + ${a}.`, worked: W(lesson, ["2 1/3.", "2 × 3 + 1 = 7.", "7/3."]) };
  };
  G["percent-of"] = (lv, P, lesson) => {
    const kind = pick(P.kinds || ["of"]);
    const p = pick(R(lv, [[10, 25, 50], [5, 10, 20, 25, 50, 75], [12, 15, 30, 35, 40, 60, 85]])), amt = pick([20, 40, 60, 80, 120, 200, 240, 360, 500]);
    const v = p * amt / 100;
    if (kind === "discount") return { html: `A $${amt} jacket is ${p}% off. What is the sale price?`, words: true, ans: amt - v, ansText: `$${num(amt - v)}`, remind: `Find ${p}% of $${amt} ($${num(v)}), then take it away.`, worked: W(lesson, ["$80 with 25% off.", "25% of 80 = 20.", "80 − 20 = $60."]) };
    if (kind === "increase") return { html: `$${amt} is increased by ${p}%. What is the new amount?`, words: true, ans: amt + v, ansText: `$${num(amt + v)}`, remind: `Find ${p}% of $${amt} ($${num(v)}), then add it on.`, worked: W(lesson, ["$80 up by 25%.", "25% of 80 = 20.", "80 + 20 = $100."]) };
    if (kind === "as-percent") { const tot = pick([20, 25, 40, 50]), part = rnd(1, tot - 1); return { html: `What is ${part} out of ${tot} as a percentage?`, words: true, ans: part / tot * 100, ansText: `${num(part / tot * 100)}%`, remind: `Divide ${part} by ${tot}, then multiply by 100.`, worked: W(lesson, ["12 out of 20.", "12 ÷ 20 = 0.6.", "0.6 × 100 = 60%."]) }; }
    return { html: `What is ${p}% of ${amt}?`, words: true, ans: v, ansText: num(v), remind: `${p}% means ${p} out of 100. Find 1% (${num(amt / 100)}) and multiply by ${p}, or use known shortcuts like 10% = ÷10.`, worked: W(lesson, ["25% of 60.", "25% = 1/4.", "60 ÷ 4 = 15."]) };
  };
  G["fdp-convert"] = (lv, P, lesson) => {
    const [f, d, p] = pick([["1/2", "0.5", "50%"], ["1/4", "0.25", "25%"], ["3/4", "0.75", "75%"], ["1/10", "0.1", "10%"], ["1/5", "0.2", "20%"], ["2/5", "0.4", "40%"], ["3/10", "0.3", "30%"], ["1/100", "0.01", "1%"], ["7/10", "0.7", "70%"], ["4/5", "0.8", "80%"]]);
    const t = pick(["f2p", "d2p", "p2d"]);
    const all = { f: ["1/2", "1/4", "3/4", "1/10", "1/5", "2/5"], d: ["0.5", "0.25", "0.75", "0.1", "0.2", "0.4", "0.05", "2.5"], p: ["50%", "25%", "75%", "10%", "20%", "40%", "5%", "2.5%"] };
    if (t === "f2p") return mc(`Which percentage equals ${f}?`, p, all.p.filter(x => x !== p), { words: true, remind: "Make the fraction out of 100, or divide top by bottom and × 100.", worked: W(lesson, ["3/4 as a %.", "3/4 = 75/100.", "75%."]) });
    if (t === "d2p") return mc(`Which percentage equals ${d}?`, p, all.p.filter(x => x !== p), { words: true, remind: "Multiply the decimal by 100.", worked: W(lesson, ["0.4 as a %.", "0.4 × 100 = 40.", "40%."]) });
    return mc(`Which decimal equals ${p}?`, d, all.d.filter(x => x !== d), { words: true, remind: "Divide the percentage by 100.", worked: W(lesson, ["35% as a decimal.", "35 ÷ 100 = 0.35.", "0.35."]) });
  };
  G["integers"] = (lv, P, lesson) => {
    const op = pick(P.ops || ["+", "−", "×", "÷"]), m = R(lv, [10, 20, 50]);
    let a = rnd(-m, m), b = rnd(-m, m) || 1, ans;
    if (op === "+") ans = a + b; if (op === "−") ans = a - b; if (op === "×") { a = rnd(-12, 12); b = rnd(-12, 12) || 2; ans = a * b; }
    if (op === "÷") { b = rnd(-12, 12) || 3; ans = rnd(-12, 12); a = ans * b; }
    const p = x => x < 0 ? `(${x})` : String(x);
    return { html: `${p(a)} ${op} ${p(b)} = ?`, ans, ansText: String(ans),
      remind: op === "+" || op === "−" ? "Use a number line. Subtracting a negative is the same as adding a positive." : "Same signs give a positive answer. Different signs give a negative answer.",
      worked: W(lesson, op === "+" || op === "−" ? ["−3 − (−5).", "Subtracting −5 is adding 5.", "−3 + 5 = 2."] : ["(−4) × 6.", "Different signs → negative.", "4 × 6 = 24, so −24."]) };
  };
  G["order-ops"] = (lv, P, lesson) => {
    const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 9), d = rnd(1, 9);
    const forms = [[`${a} + ${b} × ${c}`, a + b * c], [`(${a} + ${b}) × ${c}`, (a + b) * c], [`${a * c} ÷ ${c} + ${b}`, a + b], [`${a} × ${b} − ${c} × ${d}`, a * b - c * d], [`${a}² + ${b}`, a * a + b]];
    const [e, v] = pick(forms.slice(0, R(lv, [2, 4, 5])));
    return { html: `${e} = ?`, ans: v, ansText: String(v), remind: "Brackets first, then powers, then × and ÷ left to right, then + and − left to right.", worked: W(lesson, ["3 + 4 × 2.", "Multiply first: 4 × 2 = 8.", "3 + 8 = 11."]) };
  };
  G["powers"] = (lv, P, lesson) => {
    const kind = pick(P.kinds || ["square", "cube", "sqrt"]);
    if (kind === "square") { const n = rnd(2, R(lv, [10, 15, 20])); return { html: `${n}² = ?`, ans: n * n, ansText: String(n * n), remind: `${n}² means ${n} × ${n}.`, worked: W(lesson, ["7².", "7 × 7.", "= 49."]) }; }
    if (kind === "cube") { const n = rnd(2, R(lv, [5, 6, 10])); return { html: `${n}³ = ?`, ans: n ** 3, ansText: String(n ** 3), remind: `${n}³ means ${n} × ${n} × ${n}.`, worked: W(lesson, ["4³.", "4 × 4 × 4.", "= 64."]) }; }
    if (kind === "sqrt") { const n = rnd(2, R(lv, [10, 15, 20])); return { html: `√${n * n} = ?`, ans: n, ansText: String(n), remind: "What number times itself makes this?", worked: W(lesson, ["√81.", "9 × 9 = 81.", "= 9."]) }; }
    if (kind === "index-law") {
      const b = pick(["2", "3", "a", "x", "5"]), m = rnd(2, 9), n = rnd(2, 9), t = pick(["mul", "div", "pow"]);
      if (t === "mul") return { html: `${b}<sup>${m}</sup> × ${b}<sup>${n}</sup> = ${b}<sup>□</sup>`, ans: m + n, ansText: String(m + n), remind: "Same base, multiplying: add the powers.", worked: W(lesson, ["x³ × x⁴.", "Add the powers: 3 + 4.", "= x⁷."]) };
      if (t === "div") { const M = Math.max(m, n) + 1; return { html: `${b}<sup>${M}</sup> ÷ ${b}<sup>${n}</sup> = ${b}<sup>□</sup>`, ans: M - n, ansText: String(M - n), remind: "Same base, dividing: subtract the powers.", worked: W(lesson, ["x⁷ ÷ x².", "Subtract: 7 − 2.", "= x⁵."]) }; }
      return { html: `(${b}<sup>${m}</sup>)<sup>${n}</sup> = ${b}<sup>□</sup>`, ans: m * n, ansText: String(m * n), remind: "A power of a power: multiply the powers.", worked: W(lesson, ["(x³)².", "Multiply: 3 × 2.", "= x⁶."]) };
    }
    if (kind === "zero-neg") { const b = rnd(2, 5), n = rnd(1, 3);
      const q = Math.random() < .5 ? { html: `${b}<sup>0</sup> = ?`, ans: 1, ansText: "1", remind: "Anything (except 0) to the power 0 is 1." }
        : { html: `${b}<sup>−${n}</sup> = 1 ÷ ?`, ans: b ** n, ansText: String(b ** n), remind: `A negative power means 1 over the positive power: ${b}^−${n} = 1/${b}^${n}.` };
      return Object.assign(q, { worked: W(lesson, ["2⁻³.", "= 1/2³.", "= 1/8."]) }); }
    const n = rnd(2, 6), b = pick([2, 3, 10]); return { html: `${b}<sup>${n}</sup> = ?`, ans: b ** n, ansText: fmt(b ** n), remind: `Multiply ${b} by itself ${n} times.`, worked: W(lesson, ["2⁵.", "2 × 2 × 2 × 2 × 2.", "= 32."]) };
  };
  G["sci-notation"] = (lv, P, lesson) => {
    const m = rnd(11, 99) / 10, e = rnd(R(lv, [2, -4, -6]), R(lv, [6, 6, 9])) || 3;
    const val = m * 10 ** e, plain = e >= 0 ? fmt(Math.round(val)) : val.toFixed(-e + 1).replace(/0+$/, "");
    if (Math.random() < .5) return { html: `Write ${plain} in scientific notation: ${m} × 10<sup>□</sup>`, ans: e, ansText: String(e), remind: "Count how many places the decimal point moves to make a number between 1 and 10. Moving left gives a positive power; right gives negative.", worked: W(lesson, ["45 000 = 4.5 × 10^□.", "The point moves 4 places left.", "□ = 4."]) };
    return mc(`What is ${m} × 10<sup>${e}</sup> as an ordinary number?`, plain, [e >= 0 ? fmt(Math.round(m * 10 ** (e + 1))) : (m * 10 ** (e - 1)).toFixed(-e + 2).replace(/0+$/, ""), e >= 0 ? fmt(Math.round(m * 10 ** (e - 1))) : (m * 10 ** (e + 1)).toFixed(Math.max(1, -e)).replace(/0+$/, ""), String(m * 10)], { words: true, remind: "Move the decimal point: right for positive powers, left for negative powers.", worked: W(lesson, ["3.2 × 10³.", "Move the point 3 places right.", "3200."]) });
  };
  G["primes"] = (lv, P, lesson) => {
    const isP = n => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
    const kind = pick(P.kinds || ["is-prime", "hcf", "lcm"]);
    if (kind === "is-prime") { const n = rnd(2, R(lv, [30, 60, 100])); return mc(`Is ${n} prime or composite?`, isP(n) ? "Prime" : "Composite", [isP(n) ? "Composite" : "Prime"], { words: true, remind: "A prime has exactly two factors: 1 and itself. Try dividing by 2, 3, 5, 7.", worked: W(lesson, ["Is 21 prime?", "21 ÷ 3 = 7.", "It has other factors, so composite."]) }); }
    if (kind === "hcf") { const k = rnd(2, 9), a = k * rnd(2, 9), b = k * rnd(2, 9), h = gcd(a, b); return { html: `What is the highest common factor of ${a} and ${b}?`, words: true, ans: h, ansText: String(h), remind: "List the factors of each number and find the biggest one they share.", worked: W(lesson, ["HCF of 12 and 18.", "Factors of 12: 1,2,3,4,6,12. Of 18: 1,2,3,6,9,18.", "Biggest shared: 6."]) }; }
    const a = rnd(2, 12), b = rnd(2, 12), l = a * b / gcd(a, b); return { html: `What is the lowest common multiple of ${a} and ${b}?`, words: true, ans: l, ansText: String(l), remind: "List multiples of each until you find the first one they share.", worked: W(lesson, ["LCM of 4 and 6.", "4, 8, 12… and 6, 12…", "12."]) };
  };
  G["ratio"] = (lv, P, lesson) => {
    const kind = pick(P.kinds || ["share", "simplify", "rate"]);
    if (kind === "simplify") { const a = rnd(1, 7), b = rnd(1, 9), k = rnd(2, 6); if (gcd(a, b) !== 1 || a === b) return G["ratio"](lv, P, lesson); return mc(`Simplify the ratio ${a * k} : ${b * k}`, `${a} : ${b}`, [`${b} : ${a}`, `${a * k} : ${b}`, `${a + 1} : ${b + 1}`, `${a * 2} : ${b}`], { words: true, remind: `Divide both parts by ${k}.`, worked: W(lesson, ["12 : 18.", "Both divide by 6.", "2 : 3."]) }); }
    if (kind === "share") { const a = rnd(1, 5), b = rnd(1, 5), k = rnd(2, 12), tot = (a + b) * k; return { html: `$${tot} is shared in the ratio ${a} : ${b}. How much is the bigger share?`, words: true, ans: Math.max(a, b) * k, ansText: `$${Math.max(a, b) * k}`, remind: `Add the parts (${a + b}), find one part ($${tot} ÷ ${a + b} = $${k}), then multiply.`, worked: W(lesson, ["$40 in the ratio 3 : 1.", "4 parts, so one part = $10.", "Bigger share = 3 × $10 = $30."]) }; }
    if (kind === "rate") { const h = rnd(2, 6), s = rnd(40, 100), d = h * s; return { html: `A car travels ${d} km in ${h} hours. What is its average speed in km/h?`, words: true, ans: s, ansText: `${s} km/h`, remind: "Speed = distance ÷ time.", worked: W(lesson, ["180 km in 3 h.", "180 ÷ 3.", "60 km/h."]) }; }
    const p = rnd(2, 9), n = rnd(2, 6), c = p * n, m = rnd(2, 9); return { html: `${n} pens cost $${c}. How much do ${m} pens cost?`, words: true, ans: p * m, ansText: `$${p * m}`, remind: `Find the cost of 1 pen first ($${c} ÷ ${n}).`, worked: W(lesson, ["3 pens cost $6.", "1 pen = $2.", "5 pens = $10."]) };
  };
  G["money-finance"] = (lv, P, lesson) => {
    const kind = pick(P.kinds || ["simple-interest", "profit", "budget"]);
    if (kind === "simple-interest") { const pr = pick([500, 1000, 2000, 5000]), r = pick([2, 3, 4, 5, 6]), t = rnd(1, 5), i = pr * r * t / 100; return { html: `$${fmt(pr)} is invested at ${r}% per year simple interest for ${t} years. How much interest is earned?`, words: true, ans: i, ansText: `$${fmt(i)}`, remind: "Simple interest = principal × rate × time (rate as a decimal).", worked: W(lesson, ["$1000 at 5% for 3 years.", "1000 × 0.05 × 3.", "$150."]) }; }
    if (kind === "compound") { const pr = pick([1000, 2000, 5000]), r = pick([5, 10]), t = rnd(2, 3), A = Math.round(pr * (1 + r / 100) ** t * 100) / 100; return { html: `$${fmt(pr)} grows at ${r}% per year compound interest for ${t} years. What is the final amount (to the nearest cent)?`, words: true, ans: A, tol: .011, ansText: `$${A.toFixed(2)}`, remind: `Multiply by ${1 + r / 100} once for each year: ${pr} × ${1 + r / 100}^${t}.`, worked: W(lesson, ["$1000 at 10% for 2 years.", "1000 × 1.1 × 1.1.", "$1210."]) }; }
    if (kind === "profit") { const c = rnd(5, 40), s = c + rnd(2, 20), n = rnd(5, 30); return { html: `A shop buys ${n} hats at $${c} each and sells them all for $${s} each. What is the total profit?`, words: true, ans: (s - c) * n, ansText: `$${(s - c) * n}`, remind: "Profit per item = selling price − cost. Then multiply by how many.", worked: W(lesson, ["Buy at $10, sell at $15, 4 items.", "Profit each = $5.", "Total = $20."]) }; }
    const inc = pick([400, 500, 600, 800]), sp = [rnd(50, 150), rnd(100, 200), rnd(30, 120)], left = inc - sp.reduce((a, b) => a + b, 0);
    return { html: `Jo earns $${inc} a week and spends $${sp[0]} on food, $${sp[1]} on rent and $${sp[2]} on transport. How much is left to save?`, words: true, ans: left, ansText: `$${left}`, remind: "Add up the spending, then take it away from the income.", worked: W(lesson, ["Earn $500, spend $120 + $200.", "Spending = $320.", "Left = $180."]) };
  };

  /* ---------- algebra ---------- */
  G["substitute"] = (lv, P, lesson) => {
    const x = rnd(R(lv, [1, -5, -9]), 9) || 2, a = rnd(2, 9), b = rnd(1, 12);
    const forms = [[`${a}x + ${b}`, a * x + b], [`${a}x − ${b}`, a * x - b], [`x² + ${b}`, x * x + b], [`${a}(x + ${b})`, a * (x + b)], [`${a}x² − x`, a * x * x - x]];
    const [e, v] = pick(forms.slice(0, R(lv, [2, 4, 5])));
    return { html: `If x = ${x}, what is ${e}?`, words: true, ans: v, ansText: String(v), remind: `Replace x with ${x}, then follow the order of operations.`, worked: W(lesson, ["3x + 2 when x = 4.", "3 × 4 + 2.", "12 + 2 = 14."]) };
  };
  G["solve-linear"] = (lv, P, lesson) => {
    const x = rnd(R(lv, [1, -9, -9]), 12) || 3, a = rnd(2, 9), b = rnd(1, 20), c = rnd(1, Math.max(1, a - 1));
    const t = pick(R(lv, [["one"], ["one", "two"], ["two", "both", "brackets"]]));
    if (t === "one") return { html: `Solve: x + ${b} = ${x + b}`, ans: x, ansText: `x = ${x}`, remind: `Take ${b} from both sides.`, worked: W(lesson, ["x + 7 = 12.", "Take 7 from both sides.", "x = 5."]) };
    if (t === "two") return { html: `Solve: ${a}x + ${b} = ${a * x + b}`, ans: x, ansText: `x = ${x}`, remind: `Take ${b} from both sides, then divide by ${a}.`, worked: W(lesson, ["3x + 4 = 19.", "3x = 15.", "x = 5."]) };
    if (t === "brackets") return { html: `Solve: ${a}(x + ${b}) = ${a * (x + b)}`, ans: x, ansText: `x = ${x}`, remind: `Divide both sides by ${a}, then take ${b} away.`, worked: W(lesson, ["2(x + 3) = 16.", "x + 3 = 8.", "x = 5."]) };
    return { html: `Solve: ${a}x + ${b} = ${c}x + ${b + (a - c) * x}`, ans: x, ansText: `x = ${x}`, remind: `Get the x terms on one side: take ${c}x from both sides, then solve.`, worked: W(lesson, ["5x + 2 = 3x + 10.", "2x + 2 = 10, so 2x = 8.", "x = 4."]) };
  };
  G["inequality"] = (lv, P, lesson) => {
    const a = rnd(2, 6), b = rnd(1, 15), x = rnd(1, 10), c = a * x + b, sym = pick(["<", ">", "≤", "≥"]);
    return mc(`Solve: ${a}x + ${b} ${sym} ${c}`, `x ${sym} ${x}`, [`x ${sym} ${x + 1}`, `x ${{ "<": ">", ">": "<", "≤": "≥", "≥": "≤" }[sym]} ${x}`, `x ${sym} ${c - b}`, `x = ${x}`], { remind: "Solve it like an equation, keeping the inequality sign (it only flips if you multiply or divide by a negative).", worked: W(lesson, ["2x + 3 < 11.", "2x < 8.", "x < 4."]) });
  };
  G["like-terms"] = (lv, P, lesson) => {
    const v = pick(["x", "a", "m"]), a = rnd(1, 9), b = rnd(1, 9), c = rnd(1, 9), d = rnd(1, 9), sub = Math.random() < .4;
    const xs = sub ? a - b : a + b, ks = c + d, term = (k, s) => k === 0 ? "" : k === 1 ? s : k === -1 ? "−" + s : k + s;
    const right = `${term(xs, v) || "0"} + ${ks}`.replace("+ -", "− ");
    return mc(`Simplify: ${a}${v} + ${c} ${sub ? "−" : "+"} ${b}${v} + ${d}`, right, [`${term(a + b + c + d, v)}`, `${term(sub ? a + b : a - b, v) || "0"} + ${ks}`, `${term(xs, v) || "0"} + ${c * d}`, `${xs + ks}${v}`], { remind: `Collect the ${v} terms together and the numbers together.`, worked: W(lesson, ["3x + 2 + 4x + 5.", "3x + 4x = 7x and 2 + 5 = 7.", "7x + 7."]) });
  };
  G["expand"] = (lv, P, lesson) => {
    const kind = pick(R(lv, [["single"], ["single", "binomial"], ["binomial", "square", "diff"]]));
    if (kind === "single") { const a = rnd(2, 9), b = rnd(1, 9), s = pick(["+", "−"]); return mc(`Expand: ${a}(x ${s} ${b})`, `${a}x ${s} ${a * b}`, [`${a}x ${s} ${b}`, `x ${s} ${a * b}`, `${a + b}x`, `${a}x ${s === "+" ? "−" : "+"} ${a * b}`], { remind: "Multiply the number outside by every term inside.", worked: W(lesson, ["3(x + 4).", "3 × x = 3x and 3 × 4 = 12.", "3x + 12."]) }); }
    const a = rnd(1, 9), b = rnd(1, 9), pm = n => n < 0 ? `− ${-n}` : `+ ${n}`;
    if (kind === "square") return mc(`Expand: (x + ${a})²`, `x² + ${2 * a}x + ${a * a}`, [`x² + ${a * a}`, `x² + ${a}x + ${a * a}`, `x² + ${2 * a}x + ${2 * a}`], { remind: "(x + a)² = x² + 2ax + a².", worked: W(lesson, ["(x + 3)².", "(x + 3)(x + 3) = x² + 3x + 3x + 9.", "x² + 6x + 9."]) });
    if (kind === "diff") return mc(`Expand: (x + ${a})(x − ${a})`, `x² − ${a * a}`, [`x² + ${a * a}`, `x² − ${2 * a}x − ${a * a}`, `x² − ${a}`], { remind: "(x + a)(x − a) = x² − a². The middle terms cancel.", worked: W(lesson, ["(x + 5)(x − 5).", "x² − 5x + 5x − 25.", "x² − 25."]) });
    const s = a + b, p = a * b;
    return mc(`Expand: (x + ${a})(x + ${b})`, `x² + ${s}x + ${p}`, [`x² + ${p}x + ${s}`, `x² + ${s}x + ${s}`, `x² + ${p}`, `2x + ${s}`], { remind: "Multiply each term in the first bracket by each term in the second, then collect like terms.", worked: W(lesson, ["(x + 2)(x + 3).", "x² + 3x + 2x + 6.", "x² + 5x + 6."]) });
  };
  G["factorise"] = (lv, P, lesson) => {
    if (lv === 0 || Math.random() < .3) { const k = rnd(2, 9), a = rnd(1, 9), b = rnd(1, 9); if (gcd(a, b) !== 1) return G["factorise"](lv, P, lesson); return mc(`Factorise: ${k * a}x + ${k * b}`, `${k}(${a === 1 ? "" : a}x + ${b})`, [`${k}(${a}x + ${k * b})`, `${a}(${k}x + ${b})`, `x(${k * a} + ${k * b})`], { remind: "Find the highest common factor of the terms and take it outside the bracket.", worked: W(lesson, ["6x + 9.", "HCF is 3.", "3(2x + 3)."]) }); }
    const a = rnd(1, 9), b = rnd(1, 9), s = a + b, p = a * b;
    return mc(`Factorise: x² + ${s}x + ${p}`, `(x + ${Math.min(a, b)})(x + ${Math.max(a, b)})`, [`(x + ${p})(x + 1)`, `(x + ${s})(x + 1)`, `(x − ${a})(x − ${b})`, `(x + ${s})(x + ${p})`], { remind: `Find two numbers that multiply to ${p} and add to ${s}.`, worked: W(lesson, ["x² + 7x + 12.", "3 × 4 = 12 and 3 + 4 = 7.", "(x + 3)(x + 4)."]) });
  };
  G["quadratic-solve"] = (lv, P, lesson) => {
    const a = rnd(1, 9), b = rnd(1, 9), s = b - a, p = -a * b;
    const pm = n => n < 0 ? `− ${-n}` : `+ ${n}`;
    return { html: `x² ${pm(s)}x ${pm(p)} = 0 has solutions x = ${a} and x = ?`, ans: -b, ansText: String(-b), remind: `Factorise: (x − ${a})(x + ${b}) = 0. Each bracket can equal 0.`, worked: W(lesson, ["x² − x − 6 = 0.", "(x − 3)(x + 2) = 0.", "x = 3 or x = −2."]) };
  };
  G["linear-graph"] = (lv, P, lesson) => {
    const kind = pick(P.kinds || ["gradient", "intercept", "y-value", "two-points"]);
    const m = pick([-3, -2, -1, 1, 2, 3, 4]), c = rnd(-6, 8), pm = n => n < 0 ? `− ${-n}` : `+ ${n}`, eq = `y = ${m === 1 ? "" : m === -1 ? "−" : m}x ${pm(c)}`;
    if (kind === "gradient") return { html: `What is the gradient of ${eq}?`, words: true, ans: m, ansText: String(m), remind: "In y = mx + c, the gradient is m, the number in front of x.", worked: W(lesson, ["y = 3x + 2.", "The number in front of x is 3.", "Gradient = 3."]) };
    if (kind === "intercept") return { html: `Where does ${eq} cross the y-axis? (Give the y-value.)`, words: true, ans: c, ansText: String(c), remind: "In y = mx + c, c is the y-intercept.", worked: W(lesson, ["y = 3x + 2.", "When x = 0, y = 2.", "y-intercept = 2."]) };
    if (kind === "y-value") { const x = rnd(-4, 5); return { html: `For ${eq}, what is y when x = ${x}?`, words: true, ans: m * x + c, ansText: String(m * x + c), remind: "Substitute the x-value into the equation.", worked: W(lesson, ["y = 2x + 1, x = 3.", "2 × 3 + 1.", "y = 7."]) }; }
    const x1 = rnd(-3, 3), x2 = x1 + rnd(1, 4), y1 = m * x1 + c, y2 = m * x2 + c;
    return { html: `What is the gradient of the line through (${x1}, ${y1}) and (${x2}, ${y2})?`, words: true, ans: m, ansText: String(m), remind: "Gradient = rise ÷ run = (change in y) ÷ (change in x).", worked: W(lesson, ["(1, 2) and (3, 8).", "Rise 6, run 2.", "Gradient = 3."]) };
  };
  G["sequence-rule"] = (lv, P, lesson) => {
    const d = pick([2, 3, 4, 5, 7, -2, -3]), a = rnd(1, 20), seq = [0, 1, 2, 3].map(i => a + d * i), n = rnd(6, R(lv, [8, 12, 20]));
    if (Math.random() < .5) return { html: `${seq.join(", ")}, … What is the ${n}th term?`, ans: a + d * (n - 1), ansText: String(a + d * (n - 1)), remind: `It goes ${d > 0 ? "up" : "down"} by ${Math.abs(d)} each time. Term n = first term + (n − 1) × ${d}.`, worked: W(lesson, ["3, 7, 11, 15… 10th term?", "Goes up by 4: 3 + 9 × 4.", "= 39."]) };
    return { html: `${seq.join(", ")}, … What is the rule? Term = ${d}n + □`, ans: a - d, ansText: String(a - d), remind: `The difference is ${d}, so start with ${d}n. Then check the first term: ${d} × 1 + □ = ${a}.`, worked: W(lesson, ["5, 8, 11, 14.", "Difference 3, so 3n. 3 × 1 + □ = 5.", "□ = 2, rule 3n + 2."]) };
  };

  /* ---------- measurement & geometry ---------- */
  G["area"] = (lv, P, lesson) => {
    const kind = pick(P.kinds || ["rectangle", "triangle", "parallelogram"]);
    const a = rnd(3, 15), b = rnd(3, 15), c = rnd(3, 12), u = P.unit || "cm";
    const K = {
      rectangle: [`A rectangle is ${a} ${u} by ${b} ${u}. What is its area in ${u}²?`, a * b, "Area = length × width."],
      square: [`A square has sides of ${a} ${u}. What is its area in ${u}²?`, a * a, "Area = side × side."],
      triangle: [`A triangle has a base of ${2 * a} ${u} and a height of ${b} ${u}. What is its area in ${u}²?`, a * b, "Area of a triangle = ½ × base × height."],
      parallelogram: [`A parallelogram has a base of ${a} ${u} and a perpendicular height of ${b} ${u}. What is its area in ${u}²?`, a * b, "Area of a parallelogram = base × perpendicular height."],
      trapezium: [`A trapezium has parallel sides of ${a} ${u} and ${a + 2 * c} ${u}, and a height of ${b} ${u}. What is its area in ${u}²?`, (a + c) * b, "Area = ½ × (sum of parallel sides) × height."],
      rhombus: [`A rhombus has diagonals of ${2 * a} ${u} and ${b} ${u}. What is its area in ${u}²?`, a * b, "Area of a rhombus = ½ × diagonal × diagonal."],
      circle: [`A circle has a radius of ${a} ${u}. What is its area in ${u}², to 1 decimal place?`, round1(Math.PI * a * a), "Area of a circle = π × r²."],
      perimeter: [`A rectangle is ${a} ${u} by ${b} ${u}. What is its perimeter in ${u}?`, 2 * (a + b), "Perimeter = add all the sides: 2 × length + 2 × width."],
      circumference: [`A circle has a diameter of ${2 * a} ${u}. What is its circumference in ${u}, to 1 decimal place?`, round1(Math.PI * 2 * a), "Circumference = π × diameter."],
      composite: [`An L-shape is made of a ${a} × ${b} rectangle and a ${c} × ${b} rectangle side by side. What is the total area in ${u}²?`, (a + c) * b, "Split the shape into rectangles, find each area, then add them."]
    }[kind];
    return { html: K[0], words: true, ans: K[1], ansText: `${fmt(K[1])} ${kind === "perimeter" || kind === "circumference" ? u : u + "²"}`, tol: kind.startsWith("circ") ? .051 : 1e-9, remind: K[2], worked: W(lesson, ["A triangle with base 10 cm and height 6 cm.", "½ × 10 × 6.", "= 30 cm²."]) };
  };
  G["volume"] = (lv, P, lesson) => {
    const kind = pick(P.kinds || ["prism"]);
    const a = rnd(2, 12), b = rnd(2, 12), h = rnd(2, 15), u = P.unit || "cm";
    const K = {
      prism: [`A rectangular prism is ${a} ${u} long, ${b} ${u} wide and ${h} ${u} high. What is its volume in ${u}³?`, a * b * h, "Volume = length × width × height."],
      cubes: [`A box is built from layers of 1 cm cubes: ${a} cubes long, ${b} wide and ${Math.min(h, 6)} layers high. How many cubes?`, a * b * Math.min(h, 6), "Cubes in one layer × number of layers."],
      "tri-prism": [`A triangular prism has a triangle face with base ${2 * a} ${u} and height ${b} ${u}. It is ${h} ${u} long. What is its volume in ${u}³?`, a * b * h, "Volume of a prism = area of the end face × length."],
      cylinder: [`A cylinder has radius ${a} ${u} and height ${h} ${u}. What is its volume in ${u}³, to 1 decimal place?`, round1(Math.PI * a * a * h), "Volume of a cylinder = π × r² × h."],
      surface: [`What is the total surface area of a rectangular prism ${a} × ${b} × ${h} ${u}, in ${u}²?`, 2 * (a * b + b * h + a * h), "Add the areas of all 6 faces: 2(lw + wh + lh)."],
      capacity: [`A tank is ${a * 10} cm × ${b * 10} cm × ${h * 10} cm. How many litres does it hold? (1000 cm³ = 1 L)`, a * b * h, "Find the volume in cm³, then divide by 1000 to get litres."]
    }[kind];
    return { html: K[0], words: true, ans: K[1], ansText: fmt(K[1]), tol: kind === "cylinder" ? .051 : 1e-9, remind: K[2], worked: W(lesson, ["A prism 4 × 3 × 5.", "4 × 3 = 12 for the base.", "12 × 5 = 60 cubic units."]) };
  };
  G["angle-calc"] = (lv, P, lesson) => {
    const kind = pick(P.kinds || ["straight", "point", "triangle"]);
    if (kind === "straight") { const a = rnd(20, 160); return { html: `Two angles sit on a straight line. One is ${a}°. What is the other?`, words: true, ans: 180 - a, ansText: `${180 - a}°`, remind: "Angles on a straight line add to 180°.", worked: W(lesson, ["One angle is 130°.", "180 − 130.", "= 50°."]) }; }
    if (kind === "point") { const a = rnd(60, 150), b = rnd(60, 150); return { html: `Three angles meet at a point. Two of them are ${a}° and ${b}°. What is the third?`, words: true, ans: 360 - a - b, ansText: `${360 - a - b}°`, remind: "Angles around a point add to 360°.", worked: W(lesson, ["Angles 100° and 120°.", "360 − 100 − 120.", "= 140°."]) }; }
    if (kind === "right") { const a = rnd(10, 80); return { html: `A right angle is split into two angles. One is ${a}°. What is the other?`, words: true, ans: 90 - a, ansText: `${90 - a}°`, remind: "The two parts add to 90°.", worked: W(lesson, ["One part is 35°.", "90 − 35.", "= 55°."]) }; }
    if (kind === "triangle") { const a = rnd(30, 90), b = rnd(20, 150 - a); return { html: `A triangle has angles of ${a}° and ${b}°. What is the third angle?`, words: true, ans: 180 - a - b, ansText: `${180 - a - b}°`, remind: "The angles in a triangle add to 180°.", worked: W(lesson, ["Angles 50° and 60°.", "180 − 50 − 60.", "= 70°."]) }; }
    if (kind === "quad") { const a = rnd(60, 120), b = rnd(60, 120), c = rnd(60, 120); return { html: `A quadrilateral has angles of ${a}°, ${b}° and ${c}°. What is the fourth angle?`, words: true, ans: 360 - a - b - c, ansText: `${360 - a - b - c}°`, remind: "The angles in a quadrilateral add to 360°.", worked: W(lesson, ["Angles 90°, 100°, 80°.", "360 − 270.", "= 90°."]) }; }
    if (kind === "parallel") { const a = rnd(35, 145), t = pick(["alternate", "corresponding", "co-interior"]); return { html: `Two parallel lines are crossed by a transversal. One angle is ${a}°. What is its ${t} angle?`, words: true, ans: t === "co-interior" ? 180 - a : a, ansText: `${t === "co-interior" ? 180 - a : a}°`, remind: "Alternate and corresponding angles are equal. Co-interior angles add to 180°.", worked: W(lesson, ["Co-interior to 70°.", "They add to 180°.", "110°."]) }; }
    const a = rnd(20, 160); return { html: `Two straight lines cross. One angle is ${a}°. What is the vertically opposite angle?`, words: true, ans: a, ansText: `${a}°`, remind: "Vertically opposite angles are equal.", worked: W(lesson, ["Lines cross making 65°.", "The opposite angle matches it.", "65°."]) };
  };
  G["pythagoras"] = (lv, P, lesson) => {
    const trip = pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25], [9, 12, 15]]);
    if (lv < 2 || Math.random() < .5) {
      if (Math.random() < .6) return { html: `A right-angled triangle has shorter sides ${trip[0]} cm and ${trip[1]} cm. How long is the hypotenuse?`, words: true, ans: trip[2], ansText: `${trip[2]} cm`, remind: "c² = a² + b². Square the short sides, add, then square root.", worked: W(lesson, ["Sides 3 and 4.", "9 + 16 = 25.", "√25 = 5."]) };
      return { html: `A right-angled triangle has hypotenuse ${trip[2]} cm and one side ${trip[0]} cm. How long is the other side?`, words: true, ans: trip[1], ansText: `${trip[1]} cm`, remind: "a² = c² − b². Square the hypotenuse, subtract the other side squared, then square root.", worked: W(lesson, ["Hypotenuse 13, side 5.", "169 − 25 = 144.", "√144 = 12."]) };
    }
    const a = rnd(2, 12), b = rnd(2, 12), c = round1(Math.hypot(a, b));
    return { html: `A right-angled triangle has shorter sides ${a} m and ${b} m. Find the hypotenuse to 1 decimal place.`, words: true, ans: c, tol: .051, ansText: `${c} m`, remind: "c² = a² + b², then square root and round.", worked: W(lesson, ["Sides 5 and 7.", "25 + 49 = 74.", "√74 ≈ 8.6."]) };
  };
  G["trig"] = (lv, P, lesson) => {
    const ang = pick([25, 30, 35, 40, 45, 50, 55, 60, 65]), r = ang * Math.PI / 180, h = rnd(5, 20), kind = pick(["opp", "adj", "angle"]);
    if (kind === "opp") { const v = round1(h * Math.sin(r)); return { html: `In a right-angled triangle the hypotenuse is ${h} cm and one angle is ${ang}°. Find the side opposite that angle, to 1 decimal place.`, words: true, ans: v, tol: .051, ansText: `${v} cm`, remind: "SOH: sin θ = opposite ÷ hypotenuse, so opposite = hypotenuse × sin θ.", worked: W(lesson, ["Hyp 10, angle 30°.", "Opposite = 10 × sin 30°.", "= 5."]) }; }
    if (kind === "adj") { const v = round1(h * Math.cos(r)); return { html: `In a right-angled triangle the hypotenuse is ${h} cm and one angle is ${ang}°. Find the side adjacent to that angle, to 1 decimal place.`, words: true, ans: v, tol: .051, ansText: `${v} cm`, remind: "CAH: cos θ = adjacent ÷ hypotenuse, so adjacent = hypotenuse × cos θ.", worked: W(lesson, ["Hyp 10, angle 60°.", "Adjacent = 10 × cos 60°.", "= 5."]) }; }
    const o = rnd(3, 12), a = rnd(3, 12), deg = Math.round(Math.atan(o / a) * 180 / Math.PI);
    return { html: `A right-angled triangle has opposite side ${o} cm and adjacent side ${a} cm. Find the angle, to the nearest degree.`, words: true, ans: deg, tol: .51, ansText: `${deg}°`, remind: "TOA: tan θ = opposite ÷ adjacent, so θ = tan⁻¹(opposite ÷ adjacent).", worked: W(lesson, ["Opposite 5, adjacent 5.", "tan θ = 1.", "θ = 45°."]) };
  };
  G["coordinates-4q"] = (lv, P, lesson) => {
    const x = rnd(-5, 5) || 3, y = rnd(-5, 5) || -2, s = 22, o = 130;
    let b = ""; for (let i = -5; i <= 5; i++) { b += `<line x1="${o + i * s}" y1="${o - 5 * s}" x2="${o + i * s}" y2="${o + 5 * s}" stroke-opacity="${i ? .15 : .9}" stroke-width="${i ? 1 : 2}"/><line x1="${o - 5 * s}" y1="${o + i * s}" x2="${o + 5 * s}" y2="${o + i * s}" stroke-opacity="${i ? .15 : .9}" stroke-width="${i ? 1 : 2}"/>`; if (i) { b += T(o + i * s, o + 14, i, 9); b += T(o - 8, o - i * s + 3, i, 9); } }
    b += `<circle cx="${o + x * s}" cy="${o - y * s}" r="6" fill="#2D57CC" stroke="none"/>`;
    return mc(`What are the coordinates of the blue dot?`, `(${x}, ${y})`, [`(${y}, ${x})`, `(${-x}, ${y})`, `(${x}, ${-y})`], { words: true, diagram: svg(260, 260, b, "A four-quadrant coordinate grid"),
      remind: "Across first (left is negative), then up or down (down is negative).", worked: W(lesson, ["A dot 3 left and 2 up.", "Left is negative: x = −3. Up: y = 2.", "(−3, 2)."]) });
  };

  /* ---------- statistics & probability ---------- */
  G["stats"] = (lv, P, lesson) => {
    const kind = pick(P.kinds || ["mean", "median", "mode", "range"]), n = R(lv, [5, 7, 9]);
    let data = Array.from({ length: n }, () => rnd(1, R(lv, [10, 20, 50])));
    if (kind === "mean") { const target = rnd(3, R(lv, [10, 20, 40])), sum = target * n; data = data.slice(0, n - 1); let rest = sum - data.reduce((a, b) => a + b, 0); if (rest < 0 || rest > 99) return G["stats"](lv, P, lesson); data.push(rest); data = shuffle(data); }
    if (kind === "mode") { const m = pick(data); data[0] = m; data[1] = m; data = shuffle(data); const c = {}; data.forEach(v => c[v] = (c[v] || 0) + 1); const top = Math.max(...Object.values(c)); if (Object.values(c).filter(v => v === top).length > 1) return G["stats"](lv, P, lesson); }
    const sorted = [...data].sort((a, b) => a - b);
    const val = { mean: data.reduce((a, b) => a + b, 0) / n, median: sorted[(n - 1) / 2], range: sorted[n - 1] - sorted[0], mode: +Object.entries(data.reduce((c, v) => (c[v] = (c[v] || 0) + 1, c), {})).sort((a, b) => b[1] - a[1])[0][0] }[kind];
    const how = { mean: "Add all the values and divide by how many there are.", median: "Put the values in order. The median is the middle one.", mode: "The mode is the value that appears most often.", range: "Range = highest value − lowest value." }[kind];
    return { html: `Find the ${kind} of: ${data.join(", ")}`, words: true, ans: val, ansText: num(val), remind: how, worked: W(lesson, ["Data: 3, 7, 5, 9, 6.", "Ordered: 3, 5, 6, 7, 9. Sum 30.", "Mean 6, median 6, range 6."]) };
  };
  G["read-chart"] = (lv, P, lesson) => {
    const cats = shuffle(["Dogs", "Cats", "Fish", "Birds", "Rabbits"]).slice(0, 4), vals = cats.map(() => rnd(2, R(lv, [8, 15, 30])));
    if (new Set(vals).size < 4) return G["read-chart"](lv, P, lesson);
    const max = Math.max(...vals), H = 150, bw = 50;
    let b = cats.map((c, i) => `<rect x="${40 + i * 70}" y="${10 + H - vals[i] / max * H}" width="${bw}" height="${vals[i] / max * H}" fill="#2D57CC" stroke="none" rx="4"/>${T(65 + i * 70, H + 28, c, 11)}${T(65 + i * 70, 5 + H - vals[i] / max * H, vals[i], 11)}`).join("");
    b += `<line x1="35" y1="${H + 10}" x2="320" y2="${H + 10}" stroke-width="2"/>`;
    const k = pick(["most", "diff", "total"]);
    const diag = svg(330, H + 36, b, "A bar chart of favourite pets");
    if (k === "most") { const top = cats[vals.indexOf(max)]; return mc(`Which pet is the most popular?`, top, cats.filter(c => c !== top), { words: true, diagram: diag, remind: "The tallest bar is the most popular.", worked: W(lesson, ["Find the tallest bar.", "Read the label underneath.", "That's the most popular."]) }); }
    if (k === "diff") { const [i, j] = shuffle([0, 1, 2, 3]); return { html: `How many more chose ${cats[i]} than ${cats[j]}? (If fewer, give a negative answer.)`, words: true, diagram: diag, ans: vals[i] - vals[j], ansText: String(vals[i] - vals[j]), remind: "Read both bars, then subtract.", worked: W(lesson, ["Dogs 12, Cats 8.", "12 − 8.", "4 more."]) }; }
    const t = vals.reduce((a, b) => a + b, 0); return { html: `How many people were surveyed altogether?`, words: true, diagram: diag, ans: t, ansText: String(t), remind: "Add up all the bars.", worked: W(lesson, ["Bars 5, 8, 3, 4.", "5 + 8 + 3 + 4.", "= 20."]) };
  };
  G["probability"] = (lv, P, lesson) => {
    const kind = pick(P.kinds || ["bag", "die", "complement"]);
    if (kind === "die") { const t = pick([["an even number", 3], ["a number greater than 4", 2], ["a 6", 1], ["a number less than 3", 2], ["a multiple of 3", 2]]); return { html: `A fair six-sided die is rolled. What is the probability of rolling ${t[0]}? (Give a fraction like 1/2.)`, words: true, ans: t[1] / 6, ansText: fracText(t[1], 6), remind: "Probability = number of ways it can happen ÷ total outcomes (6).", worked: W(lesson, ["Rolling an even number.", "2, 4, 6: 3 ways out of 6.", "3/6 = 1/2."]) }; }
    if (kind === "complement") { const p = rnd(1, 9) / 10; return { html: `The probability of rain tomorrow is ${p}. What is the probability it does not rain?`, words: true, ans: +(1 - p).toFixed(2), ansText: num(1 - p), remind: "P(not A) = 1 − P(A).", worked: W(lesson, ["P(rain) = 0.3.", "1 − 0.3.", "= 0.7."]) }; }
    if (kind === "two-step") { const a = pick(["heads"]), d = pick([1, 2, 3, 4, 5, 6]); return { html: `A coin is flipped and a die is rolled. What is the probability of getting ${a} and a ${d}? (Fraction)`, words: true, ans: 1 / 12, ansText: "1/12", remind: "There are 2 × 6 = 12 equally likely outcomes. Only one matches.", worked: W(lesson, ["Coin and die: 12 outcomes.", "Tails and 3 is one of them.", "1/12."]) }; }
    const r = rnd(1, 8), b = rnd(1, 8), g = rnd(0, 6), tot = r + b + g;
    return { html: `A bag has ${r} red, ${b} blue${g ? ` and ${g} green` : ""} marbles. One is picked at random. What is the probability it is red? (Fraction)`, words: true, ans: r / tot, ansText: fracText(r, tot), remind: `Probability = red marbles ÷ total marbles (${tot}).`, worked: W(lesson, ["3 red, 5 blue.", "8 marbles, 3 red.", "3/8."]) };
  };

  G["round-decimal"] = (lv, P, lesson) => {
    const dp = pick(R(lv, [[0, 1], [1, 2], [1, 2, 3]])), x = rnd(1000, 99999) / 10 ** pick([3, 4]);
    const r = +x.toFixed(dp), name = ["the nearest whole number", "1 decimal place", "2 decimal places", "3 decimal places"][dp];
    return { html: `Round ${x} to ${name}.`, words: true, ans: r, ansText: r.toFixed(dp), remind: "Look at the next digit along. 5 or more rounds up; 4 or less rounds down.", worked: W(lesson, ["Round 3.476 to 1 decimal place.", "The next digit after the 4 is 7.", "7 rounds up: 3.5."]) };
  };
  G["coord-geometry"] = (lv, P, lesson) => {
    const kind = pick(P.kinds || ["midpoint", "distance", "gradient"]);
    const x1 = rnd(-6, 6), y1 = rnd(-6, 6);
    if (kind === "midpoint") { const x2 = x1 + 2 * rnd(1, 5), y2 = y1 + 2 * rnd(-4, 4), which = pick(["x", "y"]); const v = which === "x" ? (x1 + x2) / 2 : (y1 + y2) / 2;
      return { html: `What is the ${which}-coordinate of the midpoint of (${x1}, ${y1}) and (${x2}, ${y2})?`, words: true, ans: v, ansText: String(v), remind: "Midpoint = average of the x's and average of the y's.", worked: W(lesson, ["Midpoint of (2, 4) and (6, 10).", "x: (2 + 6) ÷ 2 = 4. y: (4 + 10) ÷ 2 = 7.", "(4, 7)."]) }; }
    if (kind === "distance") { const [a, b] = pick([[3, 4], [6, 8], [5, 12], [8, 15]]), sx = pick([1, -1]), sy = pick([1, -1]), x2 = x1 + sx * a, y2 = y1 + sy * b;
      return { html: `What is the distance between (${x1}, ${y1}) and (${x2}, ${y2})?`, words: true, ans: Math.hypot(a, b), ansText: String(Math.hypot(a, b)), remind: "Distance = √((x₂ − x₁)² + (y₂ − y₁)²). It's Pythagoras on the grid.", worked: W(lesson, ["(1, 2) to (4, 6).", "Across 3, up 4.", "√(9 + 16) = 5."]) }; }
    const m = pick([-3, -2, -1, 1, 2, 3, 0.5, -0.5]), dx = m % 1 ? 2 * rnd(1, 3) : rnd(1, 5), x2 = x1 + dx, y2 = y1 + m * dx;
    return { html: `What is the gradient of the line segment from (${x1}, ${y1}) to (${x2}, ${y2})?`, words: true, ans: m, ansText: String(m), remind: "Gradient = (y₂ − y₁) ÷ (x₂ − x₁): rise over run.", worked: W(lesson, ["(1, 2) to (5, 10).", "Rise 8, run 4.", "Gradient 2."]) };
  };
  G["simultaneous"] = (lv, P, lesson) => {
    const x = rnd(-5, 8), y = rnd(-5, 8), a = rnd(1, 4), b = rnd(1, 4), c = rnd(1, 4), d = -rnd(1, 4);
    const pm = (k, v) => (k < 0 ? "− " : "+ ") + (Math.abs(k) === 1 ? "" : Math.abs(k)) + v;
    const e1 = `${a === 1 ? "" : a}x ${pm(b, "y")} = ${a * x + b * y}`, e2 = `${c === 1 ? "" : c}x ${pm(d, "y")} = ${c * x + d * y}`;
    const ask = pick(["x", "y"]);
    return { html: `Solve the simultaneous equations:<br>${e1}<br>${e2}<br>What is ${ask}?`, words: true, ans: ask === "x" ? x : y, ansText: `x = ${x}, y = ${y}`, remind: "Eliminate one variable: multiply so the y terms (or x terms) match, then add or subtract the equations.", worked: W(lesson, ["x + y = 10 and x − y = 2.", "Add them: 2x = 12, so x = 6.", "Then y = 4."]) };
  };
  G["exponential"] = (lv, P, lesson) => {
    const kind = pick(P.kinds || ["solve", "growth", "decay"]);
    if (kind === "solve") { const b = pick([2, 3, 5, 10]), n = rnd(2, b === 2 ? 8 : 4); return { html: `Solve: ${b}<sup>x</sup> = ${fmt(b ** n)}`, ans: n, ansText: `x = ${n}`, remind: `Write ${fmt(b ** n)} as a power of ${b}.`, worked: W(lesson, ["2ˣ = 32.", "32 = 2⁵.", "x = 5."]) }; }
    const P0 = pick([100, 200, 500, 1000]), r = pick([10, 20, 50]), t = rnd(1, 3), grow = kind === "growth", v = Math.round(P0 * (1 + (grow ? 1 : -1) * r / 100) ** t * 100) / 100;
    return { html: `A population of ${P0} ${grow ? "grows" : "decays"} by ${r}% each year. What is it after ${t} year${t > 1 ? "s" : ""}?`, words: true, ans: v, tol: .011, ansText: fmt(v), remind: `Multiply by ${grow ? 1 + r / 100 : 1 - r / 100} once for each year.`, worked: W(lesson, ["1000 growing 10% for 2 years.", "1000 × 1.1 × 1.1.", "= 1210."]) };
  };
  G["error"] = (lv, P, lesson) => {
    const actual = pick([40, 50, 80, 100, 200, 250]), meas = actual + pick([-1, 1]) * pick([1, 2, 4, 5, 10]), kind = pick(["abs", "pct"]);
    if (kind === "abs") return { html: `A length is actually ${actual} cm but is measured as ${meas} cm. What is the absolute error in cm?`, words: true, ans: Math.abs(meas - actual), ansText: `${Math.abs(meas - actual)} cm`, remind: "Absolute error = |measured − actual|.", worked: W(lesson, ["Actual 50, measured 48.", "|48 − 50|.", "= 2."]) };
    const pe = Math.round(Math.abs(meas - actual) / actual * 1000) / 10;
    return { html: `A mass is actually ${actual} g but is measured as ${meas} g. What is the percentage error? (Round to 1 decimal place.)`, words: true, ans: pe, tol: .051, ansText: `${pe}%`, remind: "Percentage error = absolute error ÷ actual value × 100.", worked: W(lesson, ["Actual 50, measured 48.", "2 ÷ 50 = 0.04.", "4%."]) };
  };
  G["scale"] = (lv, P, lesson) => {
    const kind = pick(P.kinds || ["enlarge", "map", "area-factor"]);
    if (kind === "enlarge") { const k = pick([2, 3, 4, 1.5, 0.5]), s = rnd(2, 12); return { html: `A shape is enlarged by a scale factor of ${k}. A side that was ${s} cm becomes how long?`, words: true, ans: s * k, ansText: `${num(s * k)} cm`, remind: "Multiply every length by the scale factor.", worked: W(lesson, ["Scale factor 3, side 4 cm.", "4 × 3.", "= 12 cm."]) }; }
    if (kind === "area-factor") { const k = rnd(2, 4), A = rnd(5, 20); return { html: `A shape with area ${A} cm² is enlarged by a scale factor of ${k}. What is the new area?`, words: true, ans: A * k * k, ansText: `${A * k * k} cm²`, remind: `Lengths × ${k}, so areas × ${k}² = ${k * k}.`, worked: W(lesson, ["Area 10, scale factor 3.", "Area factor 3² = 9.", "90 cm²."]) }; }
    const sc = pick([1000, 10000, 50000, 100000]), cm = rnd(2, 15), km = cm * sc / 100000;
    return { html: `On a map with scale 1 : ${fmt(sc)}, two towns are ${cm} cm apart. How far apart are they in real life, in km?`, words: true, ans: km, ansText: `${num(km)} km`, remind: `Real distance = map distance × ${fmt(sc)}. Then convert cm to km (÷ 100 000).`, worked: W(lesson, ["Scale 1 : 50 000, 4 cm.", "4 × 50 000 = 200 000 cm.", "= 2 km."]) };
  };
  G["conditional"] = (lv, P, lesson) => {
    const a = rnd(5, 20), b = rnd(5, 20), c = rnd(5, 20), d = rnd(5, 20);
    const tbl = `<table class="pv" style="margin-top:8px"><tr><th></th><th>Plays sport</th><th>No sport</th><th>Total</th></tr><tr><th>Year 9</th><td>${a}</td><td>${b}</td><td>${a + b}</td></tr><tr><th>Year 10</th><td>${c}</td><td>${d}</td><td>${c + d}</td></tr><tr><th>Total</th><td>${a + c}</td><td>${b + d}</td><td>${a + b + c + d}</td></tr></table>`;
    const kind = pick(["given", "and", "or"]), T0 = a + b + c + d;
    if (kind === "given") return { html: `A student is chosen at random. Given they are in Year 9, what is the probability they play sport? (Fraction)`, words: true, extra: tbl, ans: a / (a + b), ansText: fracText(a, a + b), remind: "'Given Year 9' means only look at the Year 9 row.", worked: W(lesson, ["Given Year 9: row total 20.", "Year 9 and sport: 12.", "12/20 = 3/5."]) };
    if (kind === "and") return { html: `A student is chosen at random. What is P(Year 10 and no sport)? (Fraction)`, words: true, extra: tbl, ans: d / T0, ansText: fracText(d, T0), remind: "Find the cell where both happen, divide by the grand total.", worked: W(lesson, ["Year 10 and no sport: 8.", "Grand total 50.", "8/50 = 4/25."]) };
    return { html: `A student is chosen at random. What is P(Year 9 or plays sport)? (Fraction)`, words: true, extra: tbl, ans: (a + b + c) / T0, ansText: fracText(a + b + c, T0), remind: "Add Year 9 and sport, but don't count the overlap twice.", worked: W(lesson, ["Year 9 = 20, sport = 25, both = 12.", "20 + 25 − 12 = 33.", "33/50."]) };
  };
  G["five-number"] = (lv, P, lesson) => {
    const data = Array.from({ length: 11 }, () => rnd(10, 60)).sort((a, b) => a - b);
    const q = { min: data[0], Q1: data[2], median: data[5], Q3: data[8], max: data[10] }, k = pick(["median", "Q1", "Q3", "IQR", "range"]);
    const v = k === "IQR" ? q.Q3 - q.Q1 : k === "range" ? q.max - q.min : q[k];
    return { html: `For this ordered data, find the ${k === "IQR" ? "interquartile range (IQR)" : k}: ${data.join(", ")}`, words: true, ans: v, ansText: String(v), remind: "Median: middle value. Q1: middle of the lower half. Q3: middle of the upper half. IQR = Q3 − Q1.", worked: W(lesson, ["11 values: the median is the 6th.", "Q1 is the median of the first 5 (3rd value), Q3 the 9th value.", "IQR = Q3 − Q1."]) };
  };
  // Tolerance-aware: the app checks |answer − ans| < (tol || tiny).
})();
