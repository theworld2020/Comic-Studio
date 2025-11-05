import React from 'react';
import { ComicPageData } from '../types';

interface ComicPageProps {
  page: ComicPageData;
}

const ComicPage: React.FC<ComicPageProps> = ({ page }) => {
  return (
    <div className="comic-page-for-pdf bg-gray-50 p-4 rounded-2xl shadow-inner border-2 border-gray-200 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <img
          src={page.imageUrl}
          alt="Comic panel"
          className="w-full h-auto object-contain rounded-2xl border-4 border-white shadow-lg"
        />
      </div>
      <p className="text-center text-base text-banana-brown/80 mt-3 px-4 italic whitespace-pre-wrap">
        {page.text}
      </p>
    </div>
  );
};

export default ComicPage;