import React from 'react';
import { MatchResult } from '../../services/icdIntelligentLookup';

interface ICDSuggestionDisplayProps {
  result: MatchResult;
  onSelectAlternative: (code: string) => void;
}

export const ICDSuggestionDisplay: React.FC<ICDSuggestionDisplayProps> = ({ result, onSelectAlternative }) => {
  const getConfidenceColor = () => {
    if (result.confidence >= 85) return 'text-green-600';
    if (result.confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getConfidenceLabel = () => {
    if (result.confidence >= 85) return 'High Confidence';
    if (result.confidence >= 70) return 'Moderate Confidence';
    if (result.confidence >= 50) return 'Low Confidence';
    return 'Manual Selection Required';
  };
  
  return (
    <div className="border border-white/20 rounded-lg p-4 bg-gray-900 shadow-md">
      {/* Main Code Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-mono font-bold text-blue-400">{result.icdCode}</span>
          <span className="text-gray-300 font-medium">{result.icdDescription}</span>
        </div>
        <div className={`\${getConfidenceColor()} text-sm font-semibold px-3 py-1 bg-gray-800 rounded-full border border-gray-700`}>
          {result.confidence}% — {getConfidenceLabel()}
        </div>
      </div>
      
      {/* Match Explanation */}
      <div className="mt-3 text-xs text-gray-500 bg-gray-800/50 p-2 rounded flex items-center gap-2">
        <span className="font-medium text-gray-400">Match type:</span> 
        <span className="text-blue-300">{result.matchLayer}</span>
        {result.matchedOn && (
          <span className="ml-2 border-l border-gray-600 pl-2">Matched text: "<span className="text-gray-300">{result.matchedOn}</span>"</span>
        )}
      </div>
      
      {/* Warning for Floor Code */}
      {result.isFloorCode && (
        <div className="mt-3 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-amber-500 text-lg">⚠️</span>
            <div>
              <p className="text-amber-400 font-medium text-sm">
                No specific ICD match found
              </p>
              <p className="text-amber-300/80 text-xs mt-1">
                {result.reasoning}
              </p>
              <button className="mt-2 text-amber-500 hover:text-amber-400 underline text-xs font-semibold">
                Select ICD code manually →
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Low Confidence Warning */}
      {!result.isFloorCode && result.confidence > 0 && result.confidence < 70 && (
        <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-xs flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span><span className="font-semibold">Low confidence match.</span> Please verify this code is correct before submission.</span>
          </p>
        </div>
      )}
      
      {/* High Confidence Reasoning */}
      {result.confidence >= 70 && !result.isFloorCode && (
         <div className="mt-3 p-2 border-l-2 border-green-500 pl-3">
             <p className="text-xs text-gray-400 italic">"{result.reasoning}"</p>
         </div>
      )}

      {/* Alternative Suggestions */}
      {result.alternativeCodes && result.alternativeCodes.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-400 mb-2 font-medium">Other possible codes:</p>
          <div className="flex gap-2 flex-wrap">
            {result.alternativeCodes.map(code => (
              <button 
                key={code}
                className="px-3 py-1 text-xs font-mono border border-gray-600 text-gray-300 rounded hover:bg-gray-800 hover:border-gray-500 transition-colors"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelectAlternative(code); }}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
