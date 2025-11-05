import React, { useRef } from 'react';
import { ComicPageData } from '../types';
import ComicPage from './ComicPage';

interface ComicPreviewProps {
  title: string;
  pages: ComicPageData[];
  onRegenerate: () => void;
}

const ComicPreview: React.FC<ComicPreviewProps> = ({ title, pages, onRegenerate }) => {
  const comicRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownloadPdf = async () => {
    const { jsPDF } = window.jspdf;
    const comicContainer = comicRef.current;
    if (!comicContainer) return;

    setIsDownloading(true);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4',
    });

    const pdfPageWidth = pdf.internal.pageSize.getWidth();

    // 1. Add Title Page
    const titleElement = comicContainer.querySelector('#comic-title-display') as HTMLElement;
    if (titleElement) {
        const titleCanvas = await window.html2canvas(titleElement, { scale: 2, backgroundColor: '#E9F1FA' });
        const titleImgData = titleCanvas.toDataURL('image/png');
        const titleImgProps = pdf.getImageProperties(titleImgData);
        const pdfTitlePageHeight = (titleImgProps.height * pdfPageWidth) / titleImgProps.width;
        pdf.addImage(titleImgData, 'PNG', 0, 0, pdfPageWidth, pdfTitlePageHeight);
    }

    // 2. Add Comic Pages
    const pageElements = Array.from(comicContainer.querySelectorAll('.comic-page-for-pdf'));
    
    for (let i = 0; i < pageElements.length; i++) {
        pdf.addPage(); // Add a new page for each comic panel
        const element = pageElements[i] as HTMLElement;
        const canvas = await window.html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfPageHeight = (imgProps.height * pdfPageWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfPageWidth, pdfPageHeight);
    }

    pdf.save(`${title.replace(/\s+/g, '-').toLowerCase() || 'nano-comic'}.pdf`);
    setIsDownloading(false);
  };

  return (
    <section className="bg-white p-6 rounded-3xl shadow-lg border-4 border-banana-yellow">
      <div ref={comicRef}>
        <h2 id="comic-title-display" className="text-4xl font-bold mb-6 text-center text-jungle-green break-words">{title}</h2>
        <div className="space-y-8">
          {pages.map((page) => (
            <ComicPage key={page.id} page={page} />
          ))}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mt-8">
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="w-full sm:w-auto px-8 py-4 bg-jungle-green text-white text-xl font-bold rounded-full shadow-lg hover:bg-teal-600 transform hover:scale-105 transition-all duration-300 disabled:bg-gray-400"
        >
          {isDownloading ? 'Downloading...' : 'Download as PDF'}
        </button>
        <button
          onClick={onRegenerate}
          className="w-full sm:w-auto px-8 py-4 bg-sunset-orange text-white text-xl font-bold rounded-full shadow-lg hover:bg-orange-500 transform hover:scale-105 transition-all duration-300"
        >
          Regenerate Comic
        </button>
      </div>
    </section>
  );
};

export default ComicPreview;