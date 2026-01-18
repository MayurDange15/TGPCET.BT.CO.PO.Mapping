import React, { useState } from "react";
import axios from "axios";
import { BookOpen, FileText, Download, Loader2 } from "lucide-react";
import COInputCard from "./components/COInputCard";

function App() {
  const [loading, setLoading] = useState(false);
  const [subjectInfo, setSubjectInfo] = useState({ name: "", code: "" });

  // Initialize 5 COs with empty mappings
  const [cos, setCos] = useState(
    Array(5)
      .fill(null)
      .map((_, i) => ({
        id: i + 1,
        statement: "",
        mappings: {}, // Structure: { "PO1": [1, 3], "PO2": [2] }
      })),
  );

  // Universal Update Handler
  const updateCOData = (index, field, value) => {
    const newCos = [...cos];
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      newCos[index][parent] = { ...newCos[index][parent], [child]: value };
    } else {
      newCos[index][field] = value;
    }
    setCos(newCos);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const payload = {
        subjectName: subjectInfo.name,
        subjectCode: subjectInfo.code,
        cos: cos,
      };

      // Send to Backend
      const response = await axios.post(
        "http://localhost:5000/generate-pdf",
        payload,
        {
          responseType: "blob",
          // Increased timeout just in case it takes a while
          timeout: 30000,
        },
      );

      // if (response.data.success) {
      //   alert(
      //     "Success! Backend received data. (PDF generation coming in Step 4)",
      //   );
      //   console.log("Calculated Data from Server:", response.data.data);
      // }

      // -- STANDARD DOWNLOAD LOGIC --
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      // We set a fallback name here, but the Backend Header usually overrides it
      link.setAttribute("download", `${subjectInfo.code}_Mapping.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      alert("PDF Downloaded successfully!");
    } catch (error) {
      console.error("Generation Error:", error);

      // -- IDM DETECTION --
      // If error is "Network Error" but the backend is actually running,
      // it usually means IDM snatched the file.
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        alert(
          "Download started! \n(Note: If you use IDM, check your IDM list. It likely captured the download automatically.)",
        );
      } else {
        alert("Error generating PDF. Please check the backend console.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <BookOpen className="text-blue-600" size={40} />
            CO-PO Mapper
          </h1>
          <p className="text-gray-500">
            Automated Accreditation Documentation System
          </p>
        </div>

        {/* Subject Info Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-10 flex gap-6 items-end">
          <div className="flex-grow">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Subject Name
            </label>
            <input
              type="text"
              placeholder="e.g. Bio Reaction Engineering"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={subjectInfo.name}
              onChange={(e) =>
                setSubjectInfo({ ...subjectInfo, name: e.target.value })
              }
            />
          </div>
          <div className="w-1/3">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Subject Code
            </label>
            <input
              type="text"
              placeholder="e.g. BBT33602"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={subjectInfo.code}
              onChange={(e) =>
                setSubjectInfo({ ...subjectInfo, code: e.target.value })
              }
            />
          </div>
        </div>

        {/* The 5 CO Cards */}
        {cos.map((co, index) => (
          <COInputCard
            key={index}
            coIndex={index}
            data={co}
            updateData={updateCOData}
          />
        ))}

        {/* Action Bar */}
        <div className="sticky bottom-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <strong>{5} Course Outcomes</strong> configured
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Generating PDF... (Please Wait)
              </>
            ) : (
              <>
                <FileText className="mr-2" />
                Generate PDF Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
