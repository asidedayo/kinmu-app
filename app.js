// 勤務パターン選択で入力欄を切り替える
document.getElementById("pattern").onchange = () => {
  const p = document.getElementById("pattern").value;

  document.getElementById("am_section").style.display = "none";
  document.getElementById("pm_section").style.display = "none";

  if (p === "am") {
    document.getElementById("am_section").style.display = "block";
  }

  if (p === "pm") {
    document.getElementById("pm_section").style.display = "block";
  }

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

// H.MM形式に変換
function toHM(hours) {
  const min = ceil15(hours * 60);
  const H = Math.floor(min / 60);
  const M = min % 60;
  return `${H}.${String(M).padStart(2, "0")}`;
}

document.getElementById("calc").onclick = () => {
  const amStart = document.getElementById("am_start").value;
  const amEnd = document.getElementById("am_end").value;
  const pmStart = document.getElementById("pm_start").value;
  const pmEnd = document.getElementById("pm_end").value;
  const wage = Number(document.getElementById("wage").value);

  let amHours = 0;
  let pmHours = 0;
  let amLate = 0;
  let pmLate = 0;

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

  // 割増発生勤務帯の判定
  let overtimeTarget = ""; // "am" or "pm" or ""
  if (overtimeHours > 0) {
    if (amHours >= 8) {
      overtimeTarget = "am";
    } else {
      overtimeTarget = "pm";
    }
  }

  // 時間外割増（0.27時間 × 時間外）
  const overtimeExtraMin = ceil15(overtimeHours * 0.27 * 60);

  // 深夜割増（0.25時間 × 深夜）
  const lateExtraMin = ceil15(totalLate * 0.25 * 60);

  // 割増を勤務帯に加算
  let amExtraMin = 0;
  let pmExtraMin = 0;

  if (overtimeTarget === "am") amExtraMin += overtimeExtraMin;
  if (overtimeTarget === "pm") pmExtraMin += overtimeExtraMin;

  if (amLate > 0) amExtraMin += lateExtraMin;
  if (pmLate > 0) pmExtraMin += lateExtraMin;

  // 割増（時間）
  const amExtraHours = amExtraMin / 60;
  const pmExtraHours = pmExtraMin / 60;

  // 勤務簿記入時間（午前・午後）
  const amBookHours = amHours + amExtraHours;
  const pmBookHours = pmHours + pmExtraHours;

  const amBookText = toHM(amBookHours);
  const pmBookText = toHM(pmBookHours);

  // 給与計算用に勤務簿のH.MMを小数時間へ変換
  const amDecimal = hmToDecimal(amBookHours);
  const pmDecimal = hmToDecimal(pmBookHours);
  const totalDecimalHours = amDecimal + pmDecimal;

  // 給料計算（法律上の割増率）
  const normalHours = totalHours - overtimeHours - totalLate;
  const normalPay = normalHours * wage;
  const overtimePay = overtimeHours * wage * 1.27;
  const latePay = totalLate * wage * 1.25;
  const totalPay = Math.floor(normalPay + overtimePay + latePay);

  // バッジ表示のために午前・午後カードの要素を取得
const amCard = document.getElementById("am_section");
const pmCard = document.getElementById("pm_section");

// 既存バッジを消す
amCard.querySelectorAll(".badge").forEach(b => b.remove());
pmCard.querySelectorAll(".badge").forEach(b => b.remove());

// 午前カードにバッジ追加
if (amExtraMin > 0) {
  const badge = document.createElement("span");
  badge.className = "badge badge-overtime";
  badge.innerText = "時間外";
  amCard.querySelector(".section-title")?.appendChild(badge);
}

if (amLate > 0) {
  const badge = document.createElement("span");
  badge.className = "badge badge-late";
  badge.innerText = "深夜";
  amCard.querySelector(".section-title")?.appendChild(badge);
}

// 午後カードにバッジ追加
if (pmExtraMin > 0) {
  const badge = document.createElement("span");
  badge.className = "badge badge-overtime";
  badge.innerText = "時間外";
  pmCard.querySelector(".section-title")?.appendChild(badge);
}

if (pmLate > 0) {
  const badge = document.createElement("span");
  badge.className = "badge badge-late";
  badge.innerText = "深夜";
  pmCard.querySelector(".section-title")?.appendChild(badge);
}


  document.getElementById("result").innerText =
    `午前勤務簿記入時間：${amBookText}
午後勤務簿記入時間：${pmBookText}

通常賃金：${Math.floor(normalPay)}円
時間外：${overtimeHours.toFixed(2)}時間 → ${Math.floor(overtimePay)}円
深夜：${totalLate.toFixed(2)}時間 → ${Math.floor(latePay)}円
--------------------------------
合計賃金：${totalPay}円`;
};
