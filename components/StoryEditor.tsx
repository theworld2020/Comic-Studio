import React from 'react';

interface StoryEditorProps {
  story: string;
  onStoryChange: (story: string) => void;
}

const StoryEditor: React.FC<StoryEditorProps> = ({ story, onStoryChange }) => {
  return (
    <textarea
      id="comic-story"
      value={story}
      onChange={(e) => onStoryChange(e.target.value)}
      placeholder="Once upon a time, in a land filled with giant bananas..."
      className="w-full h-64 p-4 border-2 border-banana-brown/50 rounded-lg text-lg leading-relaxed focus:ring-2 focus:ring-sunset-orange focus:border-sunset-orange outline-none transition-all resize-y"
    />
  );
};

export default StoryEditor;