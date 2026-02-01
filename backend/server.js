// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const latex = require("node-latex");
// const fs = require("fs");
// const path = require("path");

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors()); // Allows frontend to talk to backend
// app.use(bodyParser.json());

// // --- THE LOGIC ENGINE ---

// // --- UTILS ---

// // 1. Sanitizer: Prevents crashes from special chars like _ or &
// const escapeLatex = (str) => {
//   if (!str) return "";
//   return String(str)
//     .replace(/\\/g, "\\textbackslash{}")
//     .replace(/&/g, "\\&")
//     .replace(/%/g, "\\%")
//     .replace(/\$/g, "\\$")
//     .replace(/#/g, "\\#")
//     .replace(/_/g, "\\_") // <--- THIS FIXES YOUR ERROR
//     .replace(/{/g, "\\{")
//     .replace(/}/g, "\\}")
//     .replace(/~/g, "\\textasciitilde{}")
//     .replace(/\^/g, "\\textasciicircum{}");
// };

// // Helper: Calculate Strength from Keywords
// const calculateStrength = (mappings) => {
//   const prob = mappings.length / 4;
//   if (prob >= 0.7) return 3;
//   if (prob >= 0.4) return 2;
//   if (prob > 0) return 1;
//   return 0;
// };

// // Helper: Calculate Average for the Summary Table
// // const calculateAverages = (coList) => {
// //   const poKeys = [
// //     "PO1",
// //     "PO2",
// //     "PO3",
// //     "PO4",
// //     "PO5",
// //     "PO6",
// //     "PO7",
// //     "PO8",
// //     "PO9",
// //     "PO10",
// //     "PO11",
// //     "PO12",
// //     "PSO1",
// //     "PSO2",
// //     "PSO3",
// //   ];
// //   const averages = {};

// //   poKeys.forEach((po) => {
// //     let sum = 0;
// //     coList.forEach((co) => {
// //       // co.mappings[po] is an array of indices. We calculate strength first.
// //       const strength = calculateStrength(co.mappings[po] || []);
// //       sum += strength;
// //     });
// //     // Average = Sum of strengths / 5 COs
// //     averages[po] = (sum / 5).toFixed(1);
// //   });

// //   return averages;
// // };

// // --- API ENDPOINTS ---

// // Test Endpoint to verify server is running
// app.get("/", (req, res) => {
//   res.send("CO-PO Backend is Running!");
// });

// // The Main Generator Endpoint
// app.post("/generate-pdf", (req, res) => {
//   const { subjectName, subjectCode, cos } = req.body;

//   // 1. Read Templates
//   const masterTemplate = fs.readFileSync(
//     path.join(__dirname, "templates", "master.tex"),
//     "utf8",
//   );
//   const tableSnippet = fs.readFileSync(
//     path.join(__dirname, "templates", "table_snippet.tex"),
//     "utf8",
//   );

//   let allTables = "";
//   const pos = [
//     "PO1",
//     "PO2",
//     "PO3",
//     "PO4",
//     "PO5",
//     "PO6",
//     "PO7",
//     "PO8",
//     "PO9",
//     "PO10",
//     "PO11",
//     "PO12",
//     "PSO1",
//     "PSO2",
//     "PSO3",
//   ];

//   // 2. Loop through COs
//   cos.forEach((co, index) => {
//     let currentTable = tableSnippet;

//     // Basic Info
//     currentTable = currentTable.replace(/{{CO_ID}}/g, index + 1);
//     // Sanitize the statement!
//     currentTable = currentTable.replace(
//       /{{CO_STATEMENT}}/g,
//       escapeLatex(co.statement) || "",
//     );

//     // Loop through POs
//     pos.forEach((po) => {
//       const mappings = co.mappings[po] || [];

//       // A. Checkmarks
//       for (let k = 1; k <= 4; k++) {
//         const mark = mappings.includes(k) ? "$\\checkmark$" : "-";
//         currentTable = currentTable.replace(`{{${po}_C${k}}}`, mark);
//       }

//       // B. Stats
//       const count = mappings.length;
//       const prob = (count / 4).toFixed(2);
//       const strength = calculateStrength(mappings);

//       currentTable = currentTable.replace(`{{${po}_TOT}}`, count);
//       currentTable = currentTable.replace(`{{${po}_PROB}}`, prob);
//       currentTable = currentTable.replace(`{{${po}_STR}}`, strength);
//     });

//     allTables += currentTable;
//   });

//   // 3. Inject into Master
//   let finalLatex = masterTemplate.replace("<<INSERT_TABLES_HERE>>", allTables);
//   // FIXED REPLACEMENT LOGIC:
//   // We use escapeLatex() on the user input so "Bio_Reaction" becomes "Bio\_Reaction"
//   const safeSubjectName = escapeLatex(subjectName);
//   const safeSubjectCode = escapeLatex(subjectCode);

//   finalLatex = finalLatex.replace(
//     "{{SUBJECT}}",
//     `${safeSubjectCode}: ${safeSubjectName}`,
//   );

//   // 4. Generate PDF
//   // Create a clean filename (Remove spaces/slashes)
//   const cleanCode = (subjectCode || "Subject").replace(/[^a-zA-Z0-9]/g, "_");
//   const cleanName = (subjectName || "Mapping").replace(/[^a-zA-Z0-9]/g, "_");
//   const filename = `${cleanCode}.${cleanName}.CO.PO.Mapping.pdf`;

//   // Generate PDF
//   const pdfStream = latex(finalLatex, {
//     inputs: path.join(__dirname, "templates"),
//     passes: 2, // Run LaTeX twice to ensure table widths align perfectly
//   });

//   res.setHeader("Content-Type", "application/pdf");
//   res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

//   pdfStream.pipe(res);

//   pdfStream.on("error", (err) => {
//     console.error("PDF Generation Error:", err);
//     // Don't send a response if one was already sent (prevents crash)
//     if (!res.headersSent) res.status(500).send("PDF Generation Failed");
//   });
// });

// // Start Server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const latex = require("node-latex");
const fs = require("fs");
const path = require("path");
// Import a simple concurrency limiter
const pLimit = require("p-limit");

const app = express();
const PORT = process.env.PORT || 5000;

// Limit to 1 concurrent PDF generation to prevent crashing
const limit = pLimit(1);

app.use(cors());
app.use(bodyParser.json());

// --- UTILS ---
const escapeLatex = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
};

const calculateStrength = (mappings) => {
  const count = mappings ? mappings.length : 0;
  if (count === 4) return 3;
  if (count === 3) return 2;
  if (count === 2) return 1;
  return 0;
};

// --- PDF GENERATION WORKER ---
const generatePDF = (req, res) => {
  return new Promise((resolve, reject) => {
    const { subjectName, subjectCode, cos } = req.body;

    // Safety check: Ensure we have COs
    if (!cos || cos.length === 0) {
      return reject(new Error("No COs provided"));
    }

    const masterTemplate = fs.readFileSync(
      path.join(__dirname, "templates", "master.tex"),
      "utf8",
    );
    const tableSnippet = fs.readFileSync(
      path.join(__dirname, "templates", "table_snippet.tex"),
      "utf8",
    );
    const averageSnippet = fs.readFileSync(
      path.join(__dirname, "templates", "average_snippet.tex"),
      "utf8",
    );

    let allTables = "";
    const pos = [
      "PO1",
      "PO2",
      "PO3",
      "PO4",
      "PO5",
      "PO6",
      "PO7",
      "PO8",
      "PO9",
      "PO10",
      "PO11",
      "PO12",
      "PSO1",
      "PSO2",
      "PSO3",
    ];

    // Store strengths for Average calculation
    const strengthMatrix = {};
    pos.forEach((p) => (strengthMatrix[p] = []));

    // 1. GENERATE INDIVIDUAL CO PAGES
    cos.forEach((co, index) => {
      let currentTable = tableSnippet;

      currentTable = currentTable.replace(/{{CO_ID}}/g, index + 1);
      currentTable = currentTable.replace(
        /{{CO_STATEMENT}}/g,
        escapeLatex(co.statement) || "",
      );

      pos.forEach((po) => {
        const mappings = co.mappings[po] || [];

        // Checkmarks
        for (let k = 1; k <= 4; k++) {
          const mark = mappings.includes(k) ? "$\\checkmark$" : "";
          currentTable = currentTable.replace(`{{${po}_C${k}}}`, mark);
        }

        // Stats
        const count = mappings.length;
        const prob = (count / 4).toFixed(2);
        const strength = calculateStrength(mappings);

        // Push to matrix for later average
        strengthMatrix[po].push(strength);

        currentTable = currentTable.replace(`{{${po}_TOT}}`, count);
        currentTable = currentTable.replace(`{{${po}_PROB}}`, prob);
        currentTable = currentTable.replace(`{{${po}_STR}}`, strength);
      });

      allTables += currentTable;
    });

    // 2. GENERATE AVERAGE TABLE
    let avgTable = averageSnippet;
    let summaryRows = "";

    // A. Build Dynamic Rows for Summary Table
    cos.forEach((co, index) => {
      const safeStatement = escapeLatex(co.statement) || `Course Outcome ${index + 1}`;
      let row = `\\textbf{${safeStatement}}`;

      pos.forEach((po) => {
        const strength = strengthMatrix[po][index];
        row += ` & ${strength}`;
      });

      row += " \\\\ \\hline\n";
      summaryRows += row;
    });

    avgTable = avgTable.replace("<<SUMMARY_ROWS>>", summaryRows);

    // B. Calculate Dynamic Average
    pos.forEach((po) => {
      const values = strengthMatrix[po];
      const total = values.reduce((sum, val) => sum + val, 0);

      // DIVIDE BY ACTUAL CO COUNT
      const divisor = cos.length > 0 ? cos.length : 1;

      const average = (total / divisor).toFixed(1);
      // As per user: "Go with 0" for strength 0/average 0
      const displayAvg = average;

      avgTable = avgTable.replace(`{{AVG_${po}}}`, displayAvg);
    });

    allTables += avgTable;

    // 3. FINALIZE
    let finalLatex = masterTemplate.replace(
      "<<INSERT_TABLES_HERE>>",
      allTables,
    );
    const safeSubjectName = escapeLatex(subjectName);
    const safeSubjectCode = escapeLatex(subjectCode);

    // Header Logic
    finalLatex = finalLatex.replace(
      "{{SUBJECT}}",
      `${safeSubjectCode} - ${safeSubjectName}`,
    );

    // 4. STREAM
    const cleanCode = (subjectCode || "Subject").replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${cleanCode}_Mapping.pdf`;

    const pdfStream = latex(finalLatex, {
      inputs: path.join(__dirname, "templates"),
      passes: 2,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    pdfStream.pipe(res);

    pdfStream.on("end", () => resolve());
    pdfStream.on("error", (err) => reject(err));
  });
};

// --- API ENDPOINT ---
app.post("/generate-pdf", (req, res) => {
  // Use p-limit to run one at a time
  limit(() => generatePDF(req, res)).catch((err) => {
    console.error("Queue Error:", err);
    if (!res.headersSent) {
      res.status(500).send("Server Error or Queue Timeout");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
