
export interface Character {
  id: number;
  name: string;
  image: string | null; // base64 string
  file?: File;
}

export interface ComicPageData {
  id: number;
  text: string;
  imageUrl: string;
}

declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}
