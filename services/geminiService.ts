import { GoogleGenAI, Modality } from "@google/genai";
import { Character } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY not found in environment variables");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateStory = async (prompt: string, characters: Character[] = []): Promise<string> => {
  try {
    const textPart = { text: prompt };
    const charactersWithFiles = characters.filter(c => c.file);

    if (charactersWithFiles.length > 0) {
        const imageParts = await Promise.all(
            charactersWithFiles.map((c) => fileToGenerativePart(c.file!))
        );

        const contents = {
            parts: [textPart, ...imageParts],
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
        });
        return response.text;
    } else {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    }
  } catch (error) {
    console.error("Error generating story:", error);
    return "Once upon a time, in a land of digital bananas, something went wrong and the story couldn't be told. Please try again!";
  }
};

export const generateTitle = async (story: string): Promise<string> => {
  const prompt = `Generate a short, catchy, and kid-friendly comic book title for the following story. The title should be 6 words or less. Do not add quotes or any other formatting around the title. Just return the title text.

Story:
${story}`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating title:", error);
    return "My Amazing Adventure";
  }
};

export const generateComicImage = async (
  storyChunk: string,
  characters: Character[]
): Promise<string> => {
  const characterNames = characters.map((c) => c.name).filter(Boolean);
  
  const characterPrompt = characterNames.length > 0 
    ? `The characters are named: ${characterNames.join(', ')}. Please associate the characters with their names if possible.`
    : '';

  const prompt = `Create a single, vibrant, kid-friendly comic book panel.

**INSTRUCTIONS:**
1.  **Characters:** Use the people from the provided images. Isolate them from their original backgrounds. Redraw them in a fun comic book style, but **it is crucial to keep their faces exactly as they appear in the photos.**
2.  **Expressions:** Give the characters comical expressions that match the scene's text and mood.
3.  **Background:** Create a new, colorful background that fits this scene description: "${storyChunk}".
4.  **Text:** The dialogue or narration for this panel is: "${storyChunk}". Place this text inside clear, easy-to-read speech bubbles or caption boxes within the image.
5.  **Composition:** Ensure the entire comic panel, including all characters and speech bubbles, is fully visible and not cut off at the edges.

${characterPrompt}
`;

  const imageParts = await Promise.all(
    characters
      .filter((c) => c.file)
      .map((c) => fileToGenerativePart(c.file!))
  );

  const contents = {
    parts: [{ text: prompt }, ...imageParts],
  };

  try {
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: contents,
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error)
 {
    console.error("Error generating comic image:", error);
    // Return a placeholder image on error
    return `https://picsum.photos/seed/${Math.random()}/512/512`;
  }
};