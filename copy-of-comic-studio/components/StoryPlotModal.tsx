import React, { useState } from 'react';

interface StoryPlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (plot: string) => void;
}

const StoryPlotModal: React.FC<StoryPlotModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [plot, setPlot] = useState('');

  if (!isOpen) return null;

  const handleGenerateClick = () => {
    if (plot.trim()) {
      onGenerate(plot);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg border-4 border-banana-yellow w-full max-w-lg space-y-6">
        <h2 className="text-3xl font-bold text-center text-jungle-green">Generate a Story From Your Plot</h2>
        <div className="space-y-2">
          <label htmlFor="story-plot" className="text-xl font-bold text-banana-brown mb-2 block">
            Enter your story idea
          </label>
          <textarea
            id="story-plot"
            value={plot}
            onChange={(e) => setPlot(e.target.value)}
            placeholder="e.g., A brave squirrel and a shy hedgehog search for the legendary Golden Acorn..."
            className="w-full h-48 p-4 border-2 border-banana-brown/50 rounded-lg text-lg leading-relaxed focus:ring-2 focus:ring-sunset-orange focus:border-sunset-orange outline-none transition-all resize-y"
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            onClick={handleGenerateClick}
            disabled={!plot.trim()}
            className="w-full sm:w-auto px-8 py-3 bg-jungle-green text-white text-xl font-bold rounded-full shadow-lg hover:bg-teal-600 transform hover:scale-105 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Generate Story
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 bg-gray-300 text-banana-brown text-xl font-bold rounded-full shadow-lg hover:bg-gray-400 transform hover:scale-105 transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryPlotModal;
