import React from "react";
import KeywordMatrix from "./KeywordMatrix";

const COInputCard = ({ coIndex, data, updateData }) => {
  // Handle toggling a keyword (add if missing, remove if present)
  const handleToggle = (poId, keywordIndex) => {
    const currentList = data.mappings[poId] || [];
    let newList;

    if (currentList.includes(keywordIndex)) {
      newList = currentList.filter((k) => k !== keywordIndex);
    } else {
      newList = [...currentList, keywordIndex];
    }

    updateData(coIndex, `mappings.${poId}`, newList);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>

      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Course Outcome {coIndex + 1}
        </h2>
      </div>

      {/* Statement Input */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          CO Statement
        </label>
        <textarea
          className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-700 bg-gray-50"
          rows="2"
          maxLength={60}
          placeholder="Enter the course outcome description here..."
          value={data.statement}
          onChange={(e) => updateData(coIndex, "statement", e.target.value)}
        />
      </div>

      {/* The Matrix */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Map to POs / PSOs
        </label>
        <KeywordMatrix mappings={data.mappings} onToggle={handleToggle} />
      </div>
    </div>
  );
};

export default COInputCard;
