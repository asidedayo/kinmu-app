// 勤務パターン選択で入力欄を切り替える
document.getElementById("pattern").onchange = () => {
  const p = document.getElementById("pattern").value;

  document.getElementById("am_section").style.display = "none";
  document.getElementById("pm_section").style.display = "none";

  if (p === "am") document.getElementById("am_section").style.display = "block";
  if (p === "pm") document.getElementById("pm_section").style.display = "block";
  if (p === "both") {
    document.getElementById("am_section").style.display = "block";
    document.getElementById("pm_section").style.display = "block";
  }
};

// 時刻 → 時間数に変換
function calcHours(start, end) {
  const s = new Date(`2020-01-01 ${start}`);
  const e = new Date(`2020-01-01 ${end}`);
  return (e - s) / (1000 * 60 * 60);
}

// 深夜時間（22:00〜）
function calcLateHours(start, end) {
  const lateStart = new Date("2020-01-01 22:00");
  const s = new Date(`2020-01-01 ${start}`);
  const e = new Date(`2020-01-01 ${end}`);

  if (e <= lateStart) return 0;
  if (s >= lateStart) return (e - s) / (1000 * 60 * 60);
  return (e - lateStart) / (1000 * 60 * 60);
}

// 15分単位で切り上げ
function ceil15(min) {
  return Math.ceil(min / 15) * 15;
}

// H.MM形式に変換（勤務簿用）
function toHM(hours) {
  const min = ceil15(hours * 60);
  const H = Math.floor(min / 60);
  const M = min % 60;
  return `${H}.${String(M).padStart(2, "0")}`;
}

// H.MM → 小数時間に変換（給与計算用）
function hmToDecimal(hm) {
  const [H, M] = String(hm).split(".").map(Number);
  return H + (M / 60);
}

document.getElementById("calc").onclick = () => {
  const amStart = document.getElementById("am_start").value;
  const amEnd = document.getElementById("am_end").value;
  const pmStart = document.getElementById("pm_start").value;
  const pmEnd = document.getElementById("pm_end").value;
  const wage = Number(document.getElementById("wage").value);

  let amHours = 0, pmHours = 0;
  let amLate = 0, pmLate = 0;

  // 午前
  if (amStart && amEnd) {
    amHours = calcHours(amStart, amEnd);
    amLate = calcLateHours(amStart, amEnd);
  }

  // 午後
  if (pmStart && pmEnd) {
    pmHours = calcHours(pmStart, pmEnd);
    pmLate = calcLateHours(pmStart, pmEnd);
  }

  const totalHours = amHours + pmHours;
  const totalLate = amLate + pmLate;

  // 時間外（8時間超）
  const overtimeHours = Math.max(0, totalHours - 8);

  // 割増（勤務簿用）
  const overtimeExtraMin = ceil15(overtimeHours * 0.27 * 60);
  const lateExtraMin = ceil15(totalLate * 0.25 * 60);

  let amExtraMin = 0, pmExtraMin = 0;

  if (overtimeHours > 0) {
    if (amHours >= 8) amExtraMin += overtimeExtraMin;
    else pmExtraMin += overtimeExtraMin;
  }

  if (amLate > 0) amExtraMin += lateExtraMin;
  if (pmLate > 0) pmExtraMin += lateExtraMin;

  // 勤務簿記入時間（午前・午後）
  const amBookHours = amHours + amExtraMin / 60;
  const pmBookHours = pmHours + pmExtraMin / 60;

  const amBookText = toHM(amBookHours);
  const pmBookText = toHM(pmBookHours);

  // 合計勤務簿記入時間（H.MM）
  const totalBookHM = toHM(amBookHours + pmBookHours);

  // 給与計算は勤務簿の小数時間を使う（←最重要）
  const totalDecimalHours =
    hmToDecimal(amBookText) + hmToDecimal(pmBookText);

  const totalPay = Math.floor(totalDecimalHours * wage);

  document.getElementById("result").innerText =
    `午前勤務簿記入時間：${amBookText}
午後勤務簿記入時間：${pmBookText}
合計勤務簿記入時間：${totalBookHM}

時間外：${overtimeHours.toFixed(2)}時間
深夜：${totalLate.toFixed(2)}時間

合計賃金：${totalPay}円`;
};
