import React from "react";
import { Check } from "lucide-react";

const POS = [
  { id: "PO1", title: "Engineering Knowledge" },
  { id: "PO2", title: "Problem Analysis" },
  { id: "PO3", title: "Design/Development of Solutions" },
  { id: "PO4", title: "Conduct Investigations" },
  { id: "PO5", title: "Modern Tool Usage" },
  { id: "PO6", title: "The Engineer and Society" },
  { id: "PO7", title: "Environment and Sustainability" },
  { id: "PO8", title: "Ethics" },
  { id: "PO9", title: "Individual and Team Work" },
  { id: "PO10", title: "Communication" },
  { id: "PO11", title: "Project Management and Finance" },
  { id: "PO12", title: "Life-long Learning" },
  { id: "PSO1", title: "Program Specific Outcome 1" },
  { id: "PSO2", title: "Program Specific Outcome 2" },
  { id: "PSO3", title: "Program Specific Outcome 3" },
];

const KeywordMatrix = ({ mappings, onToggle }) => {
  // Helper to calculate score for a single PO
  const getScore = (poId) => {
    const selected = mappings[poId] || [];
    const count = selected.length;
    const prob = count / 4;

    let strength = 0;
    let color = "bg-gray-100 text-gray-400 border-gray-200";

    if (prob >= 0.7) {
      strength = 3;
      color = "bg-green-100 text-green-700 border-green-200";
    } else if (prob >= 0.4) {
      strength = 2;
      color = "bg-yellow-100 text-yellow-700 border-yellow-200";
    } else if (prob > 0) {
      strength = 1;
      color = "bg-blue-50 text-blue-600 border-blue-100";
    }

    return { count, strength, color };
  };

  return (
    <div className="overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex gap-3 min-w-max px-1">
        {POS.map((po) => {
          const { count, strength, color } = getScore(po.id);

          return (
            <div
              key={po.id}
              className="w-44 flex-shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div
                className={`p-3 border-b border-gray-100 rounded-t-xl flex justify-between items-center ${count > 0 ? "bg-gray-50" : ""}`}
              >
                <span className="font-bold text-gray-700 text-sm">{po.id}</span>
                <div
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${color} font-bold uppercase`}
                >
                  Val: {strength}
                </div>
              </div>

              {/* Keyword Buttons */}
              <div className="p-2 space-y-1.5 bg-gray-50/30 flex-grow">
                {[1, 2, 3, 4].map((kIndex) => {
                  const isSelected = (mappings[po.id] || []).includes(kIndex);

                  return (
                    <button
                      key={kIndex}
                      onClick={() => onToggle(po.id, kIndex)}
                      className={`
                        w-full text-left text-[11px] px-3 py-1.5 rounded-md border transition-all duration-200 flex items-center justify-between
                        ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                            : "bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50"
                        }
                      `}
                    >
                      <span>Keyword {kIndex}</span>
                      {isSelected && <Check size={10} strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KeywordMatrix;
