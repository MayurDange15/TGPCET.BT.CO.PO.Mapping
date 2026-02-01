import React from "react";
import { Check } from "lucide-react";

// 1. The Dictionary of Keywords (Derived from your LaTeX file)
const PO_KEYWORDS = {
  PO1: [
    "Maths",
    "Science",
    "Engineering Fundamentals",
    "Engineering Specialization",
  ],
  PO2: [
    "Research Literature",
    "Maths",
    "Natural Sciences",
    "Engineering Sciences",
  ],
  PO3: [
    "Public Health and Safety Considerations",
    "Cultural Considerations",
    "Societal Considerations",
    "Environmental Considerations",
  ],
  PO4: [
    "Design of Experiments",
    "Analysis of Data",
    "Interpretation of Data",
    "Synthesis of the Information",
  ],
  PO5: [
    "Apply Appropriate Techniques",
    "Create Resources",
    "Modern Engineering",
    "IT Tools",
  ],
  PO6: [
    "Societal Issues",
    "Health Issues",
    "Safety Issues",
    "Legal or Cultural Issues",
  ],
  PO7: [
    "Societal Contexts",
    "Environment Contexts",
    "Knowledge for Sustainable Development",
    "Need for Sustainable Development",
  ],
  PO8: [
    "Ethical Principals",
    "Professional Ethics",
    "Responsibilities of Engineering Practice",
    "Norms of Engineering Practice",
  ],
  PO9: [
    "Function as Individual",
    "Function as Member",
    "Function as Leader",
    "Multidisciplinary Settings",
  ],
  PO10: [
    "Able to Comprehend",
    "Write Effective Reports",
    "Design Documentation",
    "Make Effective Presentations",
  ],
  PO11: [
    "Leader in Team",
    "Project",
    "Multidisciplinary",
    "Engineering and Management Principle",
  ],
  PO12: [
    "Need of Independent Learning",
    "Need of Life-Long Learning",
    "Preparation of Independent Learning",
    "Preparation of Life-Long Learning",
  ],
  PSO1: [
    "Bio Process Engineering",
    "Bioinformatics",
    "Biopharmaceuticals",
    "Recent Techniques",
  ],
  PSO2: [
    "Diagnostics",
    "Genetic Engineering",
    "Fermentation Technology",
    "Proficiency and Skills",
  ],
  PSO3: [
    "Biotechnology Engineering",
    "Society and People",
    "Productive HR",
    "Solutions",
  ],
};

const KeywordMatrix = ({ mappings, onToggle }) => {
  const getScore = (poId) => {
    const selected = mappings[poId] || [];
    const count = selected.length;

    let strength = 0;
    let color = "bg-gray-100 text-gray-400 border-gray-200";

    if (count === 4) {
      strength = 3;
      color = "bg-green-100 text-green-700 border-green-200";
    } else if (count === 3) {
      strength = 2;
      color = "bg-yellow-100 text-yellow-700 border-yellow-200";
    } else if (count === 2) {
      strength = 1;
      color = "bg-blue-50 text-blue-600 border-blue-100";
    } else if (count === 1) {
      strength = 0;
      color = "bg-gray-100 text-gray-400 border-gray-200";
    } else {
      strength = 0;
      color = "bg-gray-100 text-gray-400 border-gray-200";
    }

    return { count, strength, color };
  };

  const POS = Object.keys(PO_KEYWORDS).map((key) => ({ id: key }));

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
                  className={`text-[12px] px-2 py-0.5 rounded-full border ${color} font-bold uppercase`}
                >
                  Val: {strength}
                </div>
              </div>

              {/* Keyword Buttons */}
              <div className="p-2 space-y-1.5 bg-gray-50/30 flex-grow">
                {[0, 1, 2, 3].map((i) => {
                  const kIndex = i + 1; // 1-based index for logic
                  const label = PO_KEYWORDS[po.id][i]; // Text label
                  const isSelected = (mappings[po.id] || []).includes(kIndex);

                  return (
                    <button
                      key={kIndex}
                      onClick={() => onToggle(po.id, kIndex)}
                      className={`
                        w-full text-left text-[12px] px-2 py-2 rounded-md border transition-all duration-200 flex items-center justify-between group h-auto min-h-[32px]
                        ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                            : "bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50"
                        }
                      `}
                    >
                      <span className="leading-tight">{label}</span>
                      {isSelected && (
                        <Check
                          size={12}
                          strokeWidth={3}
                          className="flex-shrink-0 ml-1"
                        />
                      )}
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
