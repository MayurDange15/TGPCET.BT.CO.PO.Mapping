const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const latex = require("node-latex");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allows frontend to talk to backend
app.use(bodyParser.json());

// --- THE LOGIC ENGINE ---

// --- UTILS ---

// 1. Sanitizer: Prevents crashes from special chars like _ or &
const escapeLatex = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_") // <--- THIS FIXES YOUR ERROR
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
};

// Helper: Calculate Strength from Keywords
const calculateStrength = (mappings) => {
  const prob = mappings.length / 4;
  if (prob >= 0.7) return 3;
  if (prob >= 0.4) return 2;
  if (prob > 0) return 1;
  return 0;
};

// Helper: Calculate Average for the Summary Table
// const calculateAverages = (coList) => {
//   const poKeys = [
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
//   const averages = {};

//   poKeys.forEach((po) => {
//     let sum = 0;
//     coList.forEach((co) => {
//       // co.mappings[po] is an array of indices. We calculate strength first.
//       const strength = calculateStrength(co.mappings[po] || []);
//       sum += strength;
//     });
//     // Average = Sum of strengths / 5 COs
//     averages[po] = (sum / 5).toFixed(1);
//   });

//   return averages;
// };

// --- API ENDPOINTS ---

// Test Endpoint to verify server is running
app.get("/", (req, res) => {
  res.send("CO-PO Backend is Running!");
});

// The Main Generator Endpoint
app.post("/generate-pdf", (req, res) => {
  const { subjectName, subjectCode, cos } = req.body;

  // 1. Read Templates
  const masterTemplate = fs.readFileSync(
    path.join(__dirname, "templates", "master.tex"),
    "utf8",
  );
  const tableSnippet = fs.readFileSync(
    path.join(__dirname, "templates", "table_snippet.tex"),
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

  // 2. Loop through COs
  cos.forEach((co, index) => {
    let currentTable = tableSnippet;

    // Basic Info
    currentTable = currentTable.replace(/{{CO_ID}}/g, index + 1);
    // Sanitize the statement!
    currentTable = currentTable.replace(
      /{{CO_STATEMENT}}/g,
      escapeLatex(co.statement) || "",
    );

    // Loop through POs
    pos.forEach((po) => {
      const mappings = co.mappings[po] || [];

      // A. Checkmarks
      for (let k = 1; k <= 4; k++) {
        const mark = mappings.includes(k) ? "$\\checkmark$" : "-";
        currentTable = currentTable.replace(`{{${po}_C${k}}}`, mark);
      }

      // B. Stats
      const count = mappings.length;
      const prob = (count / 4).toFixed(2);
      const strength = calculateStrength(mappings);

      currentTable = currentTable.replace(`{{${po}_TOT}}`, count);
      currentTable = currentTable.replace(`{{${po}_PROB}}`, prob);
      currentTable = currentTable.replace(`{{${po}_STR}}`, strength);
    });

    allTables += currentTable;
  });

  // 3. Inject into Master
  let finalLatex = masterTemplate.replace("<<INSERT_TABLES_HERE>>", allTables);
  // FIXED REPLACEMENT LOGIC:
  // We use escapeLatex() on the user input so "Bio_Reaction" becomes "Bio\_Reaction"
  const safeSubjectName = escapeLatex(subjectName);
  const safeSubjectCode = escapeLatex(subjectCode);

  finalLatex = finalLatex.replace(
    "{{SUBJECT}}",
    `${safeSubjectCode}: ${safeSubjectName}`,
  );

  // 4. Generate PDF
  // Create a clean filename (Remove spaces/slashes)
  const cleanCode = (subjectCode || "Subject").replace(/[^a-zA-Z0-9]/g, "_");
  const cleanName = (subjectName || "Mapping").replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `${cleanCode}.${cleanName}.CO.PO.Mapping.pdf`;

  // Generate PDF
  const pdfStream = latex(finalLatex, {
    inputs: path.join(__dirname, "templates"),
    passes: 2, // Run LaTeX twice to ensure table widths align perfectly
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

  pdfStream.pipe(res);

  pdfStream.on("error", (err) => {
    console.error("PDF Generation Error:", err);
    // Don't send a response if one was already sent (prevents crash)
    if (!res.headersSent) res.status(500).send("PDF Generation Failed");
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
