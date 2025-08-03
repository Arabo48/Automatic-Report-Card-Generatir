let schoolLogoBase64 = "";

document.getElementById("logoUpload").addEventListener("change", function () {
  const file = this.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    schoolLogoBase64 = e.target.result;
  };
  if (file) reader.readAsDataURL(file);
});

function handleCSVUpload() {
  const fileInput = document.getElementById("csvFile");
  const file = fileInput.files[0];
  if (!file) return alert("Please select a CSV file.");

  const reader = new FileReader();
  reader.onload = function (e) {
    const csv = e.target.result;
    const data = parseCSV(csv);
    generateReportCards(data);
  };
  reader.readAsText(file);
}

function parseCSV(csv) {
  const lines = csv.split(/\r?\n/).filter(line => line.trim() !== "");
  const headers = lines[0].split(",").map(h => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentLine = lines[i].split(",");
    headers.forEach((header, index) => {
      obj[header] = currentLine[index] || "-";
    });
    records.push(obj);
  }

  return records;
}

function calculateGrade(score) {
  if (score === "-") return "-";
  score = parseFloat(score);
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
}

function getRemark(avg) {
  avg = parseFloat(avg);
  if (avg >= 70) return "Excellent result, keep the flag flying!";
  if (avg >= 60) return "Very good performance, aim even higher!";
  if (avg >= 50) return "Good effort, you can still improve.";
  if (avg >= 45) return "Needs improvement, keep trying.";
  if (avg >= 40) return "Wake up, keep trying.";
  return "Poor performance. Put in more effort.";
}

function generateReportCards(students) {
  const reportCardsDiv = document.getElementById("reportCards");
  reportCardsDiv.innerHTML = "";

  const classes = [...new Set(students.map(s => s["Class"]))];
  const classCounts = {};
  classes.forEach(cls => {
    classCounts[cls] = students.filter(s => s["Class"] === cls).length;
  });

  // Detect subjects dynamically
  const allHeaders = Object.keys(students[0]);
  const subjects = [...new Set(allHeaders.filter(h =>
    h.includes("_CA1") || h.includes("_CA2") || h.includes("_CA3") || h.includes("_Exams")
  ).map(h => h.split("_")[0]))];

  // Calculate total & averages
  students.forEach(stu => {
    stu.total = 0;
    stu.subjectCount = 0;
    subjects.forEach(sub => {
      const ca1 = parseFloat(stu[`${sub}_CA1`] || 0);
      const ca2 = parseFloat(stu[`${sub}_CA2`] || 0);
      const ca3 = parseFloat(stu[`${sub}_CA3`] || 0);
      const exam = parseFloat(stu[`${sub}_Exams`] || 0);
      const total = ca1 + ca2 + ca3 + exam;
      stu.total += total;
      stu.subjectCount += 1;
    });
    stu.average = (stu.total / stu.subjectCount).toFixed(2);
  });

  // Calculate positions
  const classGrouped = {};
  students.forEach(s => {
    const cls = s["Class"];
    if (!classGrouped[cls]) classGrouped[cls] = [];
    classGrouped[cls].push(s);
  });

  Object.values(classGrouped).forEach(studentsInClass => {
    studentsInClass.sort((a, b) => b.average - a.average);
    studentsInClass.forEach((s, idx) => {
      s.position = idx + 1;
    });
  });

  // Generate report cards
  students.forEach(stu => {
    let subjectRows = "";
    subjects.forEach(sub => {
      const ca1 = parseFloat(stu[`${sub}_CA1`] || 0);
      const ca2 = parseFloat(stu[`${sub}_CA2`] || 0);
      const ca3 = parseFloat(stu[`${sub}_CA3`] || 0);
      const exam = parseFloat(stu[`${sub}_Exams`] || 0);
      const total = ca1 + ca2 + ca3 + exam;
      const grade = calculateGrade(total);
      subjectRows += `
        <tr>
          <td>${sub}</td>
          <td>${ca1}</td>
          <td>${ca2}</td>
          <td>${ca3}</td>
          <td>${exam}</td>
          <td>${total}</td>
          <td>${grade}</td>
        </tr>
      `;
    });

    const card = document.createElement("div");
    card.classList.add("report-card");

    card.innerHTML = `
      <div style="text-align: center;">
        ${schoolLogoBase64 ? `<img src="${schoolLogoBase64}" style="max-height: 80px;"><br>` : ""}
        <h2>Pariya Academy For Modern Science & Tahfizul Quran</h2>
        <p><em>Motto: Do not be sad Located: Near Pariya Central Football Field</em></p>
        <p>End Of Third Term Report Card — Resumption Date: 14, Sept. 2025</p>
      </div>
      <hr />

      <table>
        <tr>
          <td><strong>Matric No:</strong> ${stu["Matric No"]}</td>
          <td><strong>Name:</strong> ${stu["Name"]}</td>
          <td><strong>Class:</strong> ${stu["Class"]}</td>
          <td><strong>Term:</strong> ${stu["Term"]}</td>
        </tr>
        <tr>
          <td><strong>Days Present:</strong> ${stu["Days Present"]}</td>
          <td><strong>Days Absent:</strong> ${stu["Days Absent"]}</td>
          <td><strong>Total in Class:</strong> ${classCounts[stu["Class"]]}</td>
          <td><strong>Position:</strong> ${stu.position}</td>
        </tr>
      </table>

      <table>
        <thead>
          <tr>
            <th>Subject</th>
            <th>CA1</th>
            <th>CA2</th>
            <th>CA3</th>
            <th>Exams</th>
            <th>Total</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          ${subjectRows}
          <tr>
            <th colspan="5">Total Score</th>
            <td colspan="2">${stu.total.toFixed(2)}</td>
          </tr>
          <tr>
            <th colspan="5">Average</th>
            <td colspan="2">${stu.average}</td>
          </tr>
          <tr>
            <th colspan="5">Overall Grade</th>
            <td colspan="2">${calculateGrade(stu.average)}</td>
          </tr>
        </tbody>
      </table>

      <p><strong>Remarks:</strong> ${getRemark(stu.average)}</p>

      <div class="signature-section">
        <div class="signature">
          <p>______________________</p>
          <p>Arabo Modibbo<br>FormMaster's Signature</p>
        </div>
        <div class="signature">
          <p>______________________</p>
          <p>Mal. Abubakar Bello<br>Principal's Signature</p>
        </div>
      </div>
    `;

    reportCardsDiv.appendChild(card);
  });
}

function downloadReportCards() {
  const element = document.getElementById("reportCards");
  if (!element.innerHTML.trim()) {
    alert("No report cards to download.");
    return;
  }
  const opt = {
    margin: 0.3,
    filename: 'PAS_SS1_Report_Cards.pdf',
    image: { type: 'jpeg', quality: 2.9 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'A4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'] }
  };
  html2pdf().set(opt).from(element).save();
}

function printReportCards() {
  const element = document.getElementById("reportCards");
  if (!element.innerHTML.trim()) {
    alert("No report cards to print.");
    return;
  }

  const printWindow = window.open('', '', 'width=900,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>Pariya Academy Report Cards</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .report-card { page-break-after: always; margin-bottom: 40px; border: 1px solid #ccc; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #000; padding: 6px; text-align: center; }
          .signature-section { display: flex; justify-content: space-between; margin-top: 30px; }
          .signature p { text-align: center; }
        </style>
      </head>
      <body>${element.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}