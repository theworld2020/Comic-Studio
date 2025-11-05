import React, { useState } from 'react';
import { Character, ComicPageData } from './types';
import { generateStory, generateComicImage, generateTitle } from './services/geminiService';
import CharacterUploader from './components/CharacterUploader';
import StoryEditor from './components/StoryEditor';
import ComicPreview from './components/ComicPreview';
import LuckyModal from './components/LuckyModal';
import ConfirmModal from './components/ConfirmModal';
import StoryPlotModal from './components/StoryPlotModal';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { PlusIcon } from './components/icons/PlusIcon';
import { PencilIcon } from './components/icons/PencilIcon';

const loadingMessages = [
  "Drawing with nano bananas...",
  "Coloring in the lines...",
  "Thinking up silly adventures...",
  "Waking up the characters...",
  "Building your comic world..."
];

const App: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([
    { id: 1, name: '', image: null },
    { id: 2, name: '', image: null },
  ]);
  const [title, setTitle] = useState<string>('');
  const [story, setStory] = useState<string>('');
  const [comicPages, setComicPages] = useState<ComicPageData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>(loadingMessages[0]);
  const [error, setError] = useState<string | null>(null);
  
  const [isLuckyModalOpen, setIsLuckyModalOpen] = useState(false);
  const [isStoryPlotModalOpen, setIsStoryPlotModalOpen] = useState(false);
  
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const handleAddCharacter = () => {
    setCharacters([
      ...characters,
      { id: Date.now(), name: '', image: null },
    ]);
  };

  const handleUpdateCharacter = (id: number, updatedCharacter: Partial<Character>) => {
    setCharacters(
      characters.map((char) =>
        char.id === id ? { ...char, ...updatedCharacter } : char
      )
    );
  };

  const handleRemoveCharacter = (id: number) => {
    setCharacters(characters.filter((char) => char.id !== id));
  };

  const splitStoryIntoPages = (fullStory: string): string[] => {
    const lines = fullStory.split('\n').filter(line => line.trim() !== '');
    const pages: string[] = [];
    const linesPerPage = 6;
    for (let i = 0; i < lines.length; i += linesPerPage) {
      pages.push(lines.slice(i, i + linesPerPage).join('\n'));
    }
    return pages.length > 0 ? pages : [fullStory];
  };

  const handleGenerateComic = async () => {
    if (!story.trim()) {
      setError("Please write a story first!");
      return;
    }
    setError(null);
    setIsLoading(true);
    setComicPages([]);

    const intervalId = setInterval(() => {
      setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
    }, 2000);
    
    let finalTitle = title.trim();
    if (!finalTitle) {
      setLoadingMessage("Thinking of a great title...");
      finalTitle = await generateTitle(story);
      setTitle(finalTitle);
    }

    const storyPages = splitStoryIntoPages(story);
    const generatedPages: ComicPageData[] = [];

    for (let i = 0; i < storyPages.length; i++) {
      const pageText = storyPages[i];
      setLoadingMessage(`Generating page ${i + 1} of ${storyPages.length}...`);
      const imageUrl = await generateComicImage(pageText, characters.filter(c => c.image));
      generatedPages.push({ id: i, text: pageText, imageUrl });
    }

    setComicPages(generatedPages);
    clearInterval(intervalId);
    setIsLoading(false);
  };
  
  const handleFeelLucky = () => {
    if (story.trim()) {
      const hasUploadedImages = characters.some(c => c.image);
      const message = hasUploadedImages
        ? "You have a story and characters. A new random story will replace your current one. Are you sure?"
        : "You have a story written. A new random story will replace it. Are you sure?";
      setConfirmModalConfig({
        isOpen: true,
        message,
        onConfirm: () => {
          setConfirmModalConfig(null);
          setIsLuckyModalOpen(true);
        }
      });
    } else {
      setIsLuckyModalOpen(true);
    }
  };

  const handleOpenStoryPlotModal = () => {
    if (story.trim()) {
      const message = "You have a story written. Generating a new one from a plot will replace it. Are you sure?";
      setConfirmModalConfig({
        isOpen: true,
        message,
        onConfirm: () => {
          setConfirmModalConfig(null);
          setIsStoryPlotModalOpen(true);
        }
      });
    } else {
      setIsStoryPlotModalOpen(true);
    }
  };
  
  const handleCancelConfirm = () => {
    setConfirmModalConfig(null);
  };

  const handleGenerateLuckyStory = async (country: string, genre: string) => {
    setIsLuckyModalOpen(false);
    setIsLoading(true);
    setLoadingMessage("Summoning a story from thin air...");
    setStory('');
    setTitle('');
    
    const charactersWithNames = characters.filter(c => c.name && c.name.trim() !== '');
    const charactersWithImages = characters.filter(c => c.file);
    const characterNames = charactersWithNames.map(c => c.name).join(', ');
    const hasImagesWithoutNames = charactersWithImages.some(c => !c.name || c.name.trim() === '');
        
    let prompt = `Generate a fun, ${genre} children's story`;

    if (characterNames) {
        prompt += ` featuring characters named: ${characterNames}`;
    }

    if (charactersWithImages.length > 0) {
        if (hasImagesWithoutNames) {
            prompt += `. The story should star the characters from the uploaded images. For any characters in images without names, analyze the image, give them a suitable name, and incorporate them into the story.`;
            if (characterNames) {
                prompt += ` The appearances of the named characters should also be based on their images.`
            }
        } else { // All images have names
            prompt += `. The appearances of the characters should be based on the uploaded images.`
        }
    }

    if (country && country !== 'anywhere') {
      prompt += ` The story is set in ${country}`;
    }
    prompt += `. The story should be wholesome, humorous, and imaginative. Please format the story into 15 to 20 short lines. Each line should be on a new line (separated by a single newline character).`;
    
    try {
      const newStory = await generateStory(prompt, charactersWithImages);
      setStory(newStory);
    } catch (e) {
      setError("Oops! The storytellers are on a break. Please try again later.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateStoryFromPlot = async (plot: string) => {
    setIsStoryPlotModalOpen(false);
    setIsLoading(true);
    setLoadingMessage("Weaving your plot into a tale...");
    setStory('');
    setTitle('');
    
    const charactersWithNames = characters.filter(c => c.name && c.name.trim() !== '');
    const charactersWithImages = characters.filter(c => c.file);
    const characterNames = charactersWithNames.map(c => c.name).join(', ');
    const hasImagesWithoutNames = charactersWithImages.some(c => !c.name || c.name.trim() === '');
    
    let prompt = `Based on the following plot, generate a fun children's story.\nPlot: "${plot}"`;
    if (characterNames) {
      prompt += `\nThe story should include characters named: ${characterNames}.`;
    }

    if (charactersWithImages.length > 0) {
        if (hasImagesWithoutNames) {
            prompt += `\nThe story should also star characters from the uploaded images. For any characters in images without names, analyze the image, give them a suitable name, and incorporate them into the story.`;
            if(characterNames) {
                prompt += ` Base the named characters' appearances on their uploaded images as well.`;
            }
        } else {
             prompt += `\nBase the characters' appearances on the uploaded images.`;
        }
    }
    
    prompt += `\nThe story should be wholesome and imaginative. Please format the story into multiple short lines. Each line should be on a new line (separated by a single newline character).`;
    
    try {
      const newStory = await generateStory(prompt, charactersWithImages);
      setStory(newStory);
    } catch (e) {
      setError("Oops! The storytellers are on a break. Please try again later.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-blue font-comic text-banana-brown p-4 sm:p-6 lg:p-8">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center z-50">
          <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-banana-yellow"></div>
          <p className="text-white text-2xl mt-6 font-bold">{loadingMessage}</p>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmModalConfig?.isOpen ?? false}
        message={confirmModalConfig?.message ?? ''}
        onConfirm={confirmModalConfig?.onConfirm ?? (() => {})}
        onCancel={handleCancelConfirm}
      />
      <LuckyModal
        isOpen={isLuckyModalOpen}
        onClose={() => setIsLuckyModalOpen(false)}
        onGenerate={handleGenerateLuckyStory}
      />
      <StoryPlotModal
        isOpen={isStoryPlotModalOpen}
        onClose={() => setIsStoryPlotModalOpen(false)}
        onGenerate={handleGenerateStoryFromPlot}
      />
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-jungle-green drop-shadow-lg">
            Comic Studio
          </h1>
          <p className="text-sunset-orange text-lg sm:text-xl mt-2">
            Turn your photos and stories into amazing comics!
          </p>
        </header>

        <main className="space-y-12">
          <section className="bg-white p-6 rounded-3xl shadow-lg border-4 border-banana-yellow">
            <h2 className="text-3xl font-bold mb-4 text-jungle-green">1. Add Your Characters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {characters.map((char) => (
                <CharacterUploader
                  key={char.id}
                  character={char}
                  onUpdate={(update) => handleUpdateCharacter(char.id, update)}
                  onRemove={() => handleRemoveCharacter(char.id)}
                />
              ))}
              <button
                onClick={handleAddCharacter}
                className="w-full h-full min-h-[200px] bg-jungle-green/10 border-4 border-dashed border-jungle-green/50 rounded-2xl flex flex-col justify-center items-center text-jungle-green hover:bg-jungle-green/20 hover:border-jungle-green transition-all duration-300 group"
              >
                <PlusIcon className="h-16 w-16 group-hover:scale-110 transition-transform" />
                <span className="text-2xl font-bold mt-2">Add More</span>
              </button>
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl shadow-lg border-4 border-banana-yellow">
            <h2 className="text-3xl font-bold mb-4 text-jungle-green">2. Write Your Story</h2>
             <div className="space-y-4">
               <div>
                  <label htmlFor="comic-title" className="text-xl font-bold text-banana-brown mb-2 block">Title (Optional)</label>
                  <input
                    id="comic-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., The Adventures of Captain Banana"
                    className="w-full p-3 border-2 border-banana-brown/50 rounded-lg text-lg focus:ring-2 focus:ring-sunset-orange focus:border-sunset-orange outline-none transition-all"
                  />
               </div>
               <div>
                  <label htmlFor="comic-story" className="text-xl font-bold text-banana-brown mb-2 block">Story</label>
                  <StoryEditor story={story} onStoryChange={setStory} />
               </div>
            </div>
          </section>

          {error && <p className="text-center text-red-500 font-bold text-lg">{error}</p>}
          
          <section className="flex flex-col justify-center items-center gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6">
              <button
                onClick={handleOpenStoryPlotModal}
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-4 bg-banana-brown text-white text-xl font-bold rounded-full shadow-lg hover:bg-yellow-800 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <PencilIcon className="h-6 w-6" />
                Generate From Plot
              </button>
               <button
                onClick={handleFeelLucky}
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-4 bg-jungle-green text-white text-xl font-bold rounded-full shadow-lg hover:bg-teal-600 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <SparklesIcon className="h-6 w-6" />
                I Feel Lucky
              </button>
            </div>
            <button
              onClick={handleGenerateComic}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 bg-sunset-orange text-white text-xl font-bold rounded-full shadow-lg hover:bg-orange-500 transform hover:scale-105 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Generate Comic Book!
            </button>
          </section>

          {comicPages.length > 0 && (
            <ComicPreview title={title} pages={comicPages} onRegenerate={handleGenerateComic}/>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
