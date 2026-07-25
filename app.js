// ===============================
// 基本計算関数
// ===============================

function calcHours(start, end) {
  const s = new Date(`2020-01-01 ${start}`);
  const e = new Date(`2020-01-01 ${end}`);
  return (e - s) / (1000 * 60 * 60);
}

function calcLateHours(start, end) {
  const lateStart = new Date("2020-01-01 22:00");
  const s = new Date(`2020-01-01 ${start}`);
  const e = new Date(`2020-01-01 ${end}`);

  if (e <= lateStart) return 0;
  if (s >= lateStart) return (e - s) / (1000 * 60 * 60);
  return (e - lateStart) / (1000 * 60 * 60);
}

function ceil15(min) {
  return Math.ceil(min / 15) * 15;
}

function toHM(hours) {
  const min = ceil15(hours * 60);
  const H = Math.floor(min / 60);
  const M = min % 60;
  return `${H}.${String(M).padStart(2, "0")}`;
}

function hmToDecimal(hm) {
  const [H, M] = String(hm).split(".").map(Number);
  return H + (M / 60);
}

// ===============================
// 保存用
// ===============================
function saveDailyResult(data) {
  const key = "kimma_monthly";
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  list.push(data);
  localStorage.setItem(key, JSON.stringify(list));
}

// 計算結果を保持する変数
let lastTotalDecimal = 0;
let lastTotalPay = 0;

// ===============================
// 計算ボタン
// ===============================
document.getElementById("calc").onclick = () => {

  const amStart = document.getElementById("am_start").value;
  const amEnd = document.getElementById("am_end").value;
  const pmStart = document.getElementById("pm_start").value;
  const pmEnd = document.getElementById("pm_end").value;
  const wage = Number(document.getElementById("wage").value);

  let amHours = 0, pmHours = 0;
  let amLate = 0, pmLate = 0;

  if (amStart && amEnd) {
    amHours = calcHours(amStart, amEnd);
    amLate = calcLateHours(amStart, amEnd);
  }

  if (pmStart && pmEnd) {
    pmHours = calcHours(pmStart, pmEnd);
    pmLate = calcLateHours(pmStart, pmEnd);
  }

  const totalHours = amHours + pmHours;
  const totalLate = amLate + pmLate;

  const overtimeHours = Math.max(0, totalHours - 8);

  const overtimeExtraMin = ceil15(overtimeHours * 0.27 * 60);
  const lateExtraMin = ceil15(totalLate * 0.25 * 60);

  let amExtraMin = 0, pmExtraMin = 0;

  if (overtimeHours > 0) {
    if (amHours >= 8) amExtraMin += overtimeExtraMin;
    else pmExtraMin += overtimeExtraMin;
  }

  if (amLate > 0) amExtraMin += lateExtraMin;
  if (pmLate > 0) pmExtraMin += lateExtraMin;

  const amBookHours = amHours + amExtraMin / 60;
  const pmBookHours = pmHours + pmExtraMin / 60;

  const amBookText = toHM(amBookHours);
  const pmBookText = toHM(pmBookHours);

  const totalBookHM = toHM(amBookHours + pmBookHours);

  const totalDecimalHours =
    hmToDecimal(amBookText) + hmToDecimal(pmBookText);

  const totalPay = Math.floor(totalDecimalHours * wage);

  // ★ 計算結果を保持（保存ボタン用）
  lastTotalDecimal = totalDecimalHours;
  lastTotalPay = totalPay;

  // ★ 結果表示（ここが壊れていると表示されない）
  document.getElementById("result").innerText =
    `午前勤務簿記入時間：${amBookText}
午後勤務簿記入時間：${pmBookText}
合計勤務簿記入時間：${totalBookHM}

時間外：${overtimeHours.toFixed(2)}時間
深夜：${totalLate.toFixed(2)}時間

合計賃金：${totalPay}円`;
};

// ===============================
// 保存ボタン
// ===============================
document.getElementById("save").onclick = () => {
  const workDate = document.getElementById("work_date").value ||
                   new Date().toISOString().split("T")[0];

  saveDailyResult({
    date: workDate,
    totalDecimal: lastTotalDecimal,
    pay: lastTotalPay
  });

  alert("保存しました！");
};

// ===============================
// 勤務パターン切替
// ===============================
document.getElementById("pattern").onchange = () => {
  const p = document.getElementById("pattern").value;

  const am = document.getElementById("am_section");
  const pm = document.getElementById("pm_section");

  if (p === "am") {
    am.style.display = "block";
    pm.style.display = "none";
  } else if (p === "pm") {
    am.style.display = "none";
    pm.style.display = "block";
  } else if (p === "both") {
    am.style.display = "block";
    pm.style.display = "block";
  } else {
    am.style.display = "none";
    pm.style.display = "none";
  }
};
