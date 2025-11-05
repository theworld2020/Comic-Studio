
import React, { ChangeEvent, useRef } from 'react';
import { Character } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface CharacterUploaderProps {
  character: Character;
  onUpdate: (updatedCharacter: Partial<Character>) => void;
  onRemove: () => void;
}

const CharacterUploader: React.FC<CharacterUploaderProps> = ({
  character,
  onUpdate,
  onRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ image: reader.result as string, file: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    onUpdate({ name: e.target.value });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-banana-yellow/20 p-4 rounded-2xl shadow-md border-2 border-banana-yellow space-y-3 relative">
      <button onClick={onRemove} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
        <TrashIcon className="h-4 w-4" />
      </button>
      <div
        className="w-full aspect-square bg-white rounded-lg flex items-center justify-center cursor-pointer border-2 border-dashed border-banana-brown/50 hover:border-banana-brown transition-colors"
        onClick={handleUploadClick}
      >
        {character.image ? (
          <img
            src={character.image}
            alt={character.name || 'Character preview'}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-center text-banana-brown/70 p-2">
            <p className="font-bold text-lg">Click to Upload</p>
            <p className="text-xs">.png, .jpg, .jpeg</p>
            <p className="text-xs mt-2 font-semibold text-red-500">Please use an image with only one face or animal.</p>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept=".jpg,.jpeg,.png"
        className="hidden"
      />
      <input
        type="text"
        value={character.name}
        onChange={handleNameChange}
        placeholder="Character's Name"
        className="w-full p-2 border-2 border-banana-brown/50 rounded-lg focus:ring-2 focus:ring-sunset-orange focus:border-sunset-orange outline-none transition-all"
      />
    </div>
  );
};

export default CharacterUploader;
