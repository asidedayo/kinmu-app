const key = "kimma_monthly";
const list = JSON.parse(localStorage.getItem(key) || "[]");

const tbody = document.querySelector("#monthlyTable tbody");
const summary = document.getElementById("summary");
const selectMonth = document.getElementById("selectMonth");
const showBtn = document.getElementById("showMonthly");
const downloadBtn = document.getElementById("downloadCSV");
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");

// 初期値：今月
selectMonth.value = new Date().toISOString().slice(0, 7);

// 月次一覧を描画する関数
function renderMonthly() {
  const month = selectMonth.value;
  tbody.innerHTML = "";
  summary.innerHTML = "";

  let filtered = list.filter(day => day.date.startsWith(month));

  // 日付昇順ソート
  filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

  let totalHours = 0;
  let totalPay = 0;

  filtered.forEach((day, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${day.date}</td>
      <td>${day.totalDecimal.toFixed(2)}時間</td>
      <td>${day.pay}円</td>
      <td><button class="delete-btn" data-index="${index}">削除</button></td>
    `;

    totalHours += day.totalDecimal;
    totalPay += day.pay;

    tbody.appendChild(tr);
  });

  const remaining = 120 - totalHours;

  summary.innerHTML = `
    <div class="summary-card">
      <div class="summary-item">
        <span class="label">勤務日数</span>
        <span class="value">${filtered.length}日</span>
      </div>

      <div class="summary-item">
        <span class="label">総勤務時間</span>
        <span class="value">${totalHours.toFixed(2)}時間</span>
      </div>

      <div class="summary-item">
        <span class="label">総賃金</span>
        <span class="value">${totalPay}円</span>
      </div>

      <div class="summary-item remaining">
        <span class="label">残勤務可能時間（120hまで）</span>
        <span class="value">${remaining.toFixed(2)}時間</span>
      </div>
    </div>
  `;

  // 削除ボタン
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.index);

      const realIndex = list.findIndex(day =>
        day.date === filtered[idx].date &&
        day.totalDecimal === filtered[idx].totalDecimal &&
        day.pay === filtered[idx].pay
      );

      if (realIndex !== -1) {
        list.splice(realIndex, 1);
        localStorage.setItem(key, JSON.stringify(list));
        renderMonthly();
      }
    };
  });
}

// CSVダウンロード
downloadBtn.onclick = () => {
  const month = selectMonth.value;
  const filtered = list.filter(day => day.date.startsWith(month));

  if (filtered.length === 0) {
    alert("この月のデータがありません");
    return;
  }

  let csv = "日付,勤務時間(Decimal),賃金\n";

  filtered.forEach(day => {
    csv += `${day.date},${day.totalDecimal.toFixed(2)},${day.pay}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${month}_勤務一覧.csv`;
  a.click();

  URL.revokeObjectURL(url);
};

// ▼▼▼ 前月（文字列で安全に計算） ▼▼▼
prevBtn.onclick = () => {
  let [y, m] = selectMonth.value.split("-").map(Number);

  m -= 1;
  if (m === 0) {
    y -= 1;
    m = 12;
  }

  selectMonth.value = `${y}-${String(m).padStart(2, "0")}`;
  renderMonthly();
};

// ▼▼▼ 翌月（文字列で安全に計算） ▼▼▼
nextBtn.onclick = () => {
  let [y, m] = selectMonth.value.split("-").map(Number);

  m += 1;
  if (m === 13) {
    y += 1;
    m = 1;
  }

  selectMonth.value = `${y}-${String(m).padStart(2, "0")}`;
  renderMonthly();
};

// 「この月の勤務を表示する」ボタン
showBtn.onclick = renderMonthly;
