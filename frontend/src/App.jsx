import React, { useState } from "react";
import axios from "axios";
import { BookOpen, FileText, Loader2, Save, Layers } from "lucide-react";
import COInputCard from "./components/COInputCard";

function App() {
  const [loading, setLoading] = useState(false);
  const [subjectInfo, setSubjectInfo] = useState({ name: "", code: "" });
  const [coCount, setCoCount] = useState(5); // Default to 5

  // Dynamic CO State
  const [cos, setCos] = useState(
    Array(5)
      .fill(null)
      .map((_, i) => ({
        id: i + 1,
        statement: "",
        mappings: {}, // Structure: { "PO1": [1, 3], "PO2": [2] }
      })),
  );

  // Handle Dropdown Change
  const handleCoCountChange = (e) => {
    const newCount = parseInt(e.target.value);
    setCoCount(newCount);

    // Resize the array while preserving existing data
    setCos((prevCos) => {
      const newCos = [...prevCos];
      if (newCount > prevCos.length) {
        // Add new empty COs
        for (let i = prevCos.length; i < newCount; i++) {
          newCos.push({ id: i + 1, statement: "", mappings: {} });
        }
      } else {
        // Remove extra COs
        newCos.splice(newCount);
      }
      return newCos;
    });
  };

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
        cos: cos, // This now sends exactly 3, 4, or 5 COs based on selection
      };

      // Send to Backend
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await axios.post(`${API_URL}/generate-pdf`, payload, {
        responseType: "blob",
        timeout: 60000, // 60 seconds timeout for queueing
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      // We set a fallback name here, but the Backend Header usually overrides it
      link.setAttribute("download", `${subjectInfo.code}_Mapping.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 429) {
        alert(
          "Server is busy processing other requests. Please try again in 10 seconds.",
        );
      } else {
        alert("Error generating PDF. Check console.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <BookOpen className="text-blue-600" size={40} />
            CO-PO Mapper
          </h1>
          <h2 className="text-2xl font-extrabold text-gray-500 mb-2 flex items-center justify-center gap-3">
            Department of Biotechnology
          </h2>
        </div>

        {/* Controls Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-5">
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
          <div className="md:col-span-4">
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
          <div className="md:col-span-3">
            <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
              <Layers size={16} /> Number of COs
            </label>
            <select
              value={coCount}
              onChange={handleCoCountChange}
              className="w-full p-3 bg-blue-50 border border-blue-200 text-blue-800 font-bold rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num} Units
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CO Cards Loop */}
        <div className="space-y-6">
          {cos.map((co, index) => (
            <COInputCard
              key={index} // Note: Ideally use a unique ID, but index works for simple lists
              coIndex={index}
              data={co}
              updateData={updateCOData}
            />
          ))}
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-6 mt-12 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-gray-200 flex justify-between items-center z-50">
          <div className="text-sm text-gray-500">
            Generating for <strong>{coCount} Units</strong>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
          >
            {loading ? <Loader2 className="animate-spin" /> : <FileText />}
            {loading ? "Processing..." : "Generate PDF Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
