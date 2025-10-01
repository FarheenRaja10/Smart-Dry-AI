import { GoogleGenAI, Type } from "@google/genai";
import type { GarmentDetails } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const garmentSchema = {
  type: Type.OBJECT,
  properties: {
    brand: {
      type: Type.STRING,
      description: "The brand name of the garment, if visible or identifiable (e.g., 'Nike', 'Levi's'). If not identifiable, this can be 'Unbranded' or 'N/A'.",
    },
    color: {
      type: Type.STRING,
      description: "The dominant color of the garment. If not applicable (e.g., for a text search), this can be 'N/A'.",
    },
    material: {
      type: Type.STRING,
      description: "The fabric or material of the garment (e.g., 'Cotton', 'Polyester', 'Wool').",
    },
    itemType: {
      type: Type.STRING,
      description: "The type of garment (e.g., 'T-Shirt', 'Blazer', 'Jeans').",
    },
    careInstruction: {
      type: Type.STRING,
      description: "The recommended care method. This must be one of 'Laundry', 'Dry Clean', or 'Unknown'.",
      enum: ['Laundry', 'Dry Clean', 'Unknown'],
    },
    problems: {
      type: Type.ARRAY,
      description: "A list of any detected problems with the garment, such as 'Coffee stain', 'Wine stain', 'Ripped seam', 'Missing button'. If no problems are found, this should be an empty array.",
      items: {
        type: Type.STRING,
      },
    },
    price: {
        type: Type.NUMBER,
        description: "A suggested price in USD for dry cleaning this specific item, based on its type and material. For example, a silk blouse might be 12.50, and a cotton t-shirt might be 5.00."
    },
    frameIndex: {
        type: Type.NUMBER,
        description: "The 0-based index of the image in the input sequence that provides the best and clearest view of this specific garment. This is required."
    }
  },
  required: ["brand", "color", "material", "itemType", "careInstruction", "problems", "price", "frameIndex"],
};

const garmentArraySchema = {
    type: Type.ARRAY,
    items: garmentSchema,
};


export async function analyzeGarmentImage(base64Image: string): Promise<GarmentDetails> {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1],
    },
  };

  const textPart = {
    text: `Analyze the garment in this image for a dry cleaning business. Identify its brand, primary color, material, and type. Determine the recommended care instruction ('Laundry' or 'Dry Clean'). Inspect for any visible problems like stains, rips, or missing buttons. Finally, suggest a reasonable price in USD for cleaning it. If the image is a barcode, first identify the product, then provide its details including brand and a price. Set frameIndex to 0.`,
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: garmentSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as GarmentDetails;

  } catch (error) {
    console.error("Error analyzing garment image:", error);
    throw new Error("Failed to analyze image with Gemini API. Please check the console for more details.");
  }
}

export async function analyzeGarmentVideoFrames(base64Images: string[]): Promise<GarmentDetails[]> {
  const imageParts = base64Images.map(img => ({
    inlineData: {
      mimeType: 'image/jpeg',
      data: img.split(',')[1],
    },
  }));

  const textPart = {
    text: `You will be given a sequence of images extracted from a video panning over several garments for a dry cleaning business. 
    Your task is to identify each unique garment. Do not create duplicate entries for the same garment if it appears in multiple frames. 
    For each distinct garment you find, provide its details: brand, primary color, material, type, recommended care instruction ('Laundry' or 'Dry Clean'), 
    any visible problems (stains, rips), and a suggested cleaning price in USD.
    Crucially, for each garment, you must provide the 'frameIndex', which is the 0-based index of the image from the sequence that best represents that garment.
    Return the result as a JSON array of garment objects. If you cannot identify any garments, return an empty array.`,
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [...imageParts, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: garmentArraySchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        return [];
    }
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as GarmentDetails[];

  } catch (error) {
    console.error("Error analyzing garment video frames:", error);
    throw new Error("Failed to analyze video with Gemini API. The model may have had trouble identifying items.");
  }
}

export async function analyzeGarmentText(text: string): Promise<GarmentDetails> {
  const prompt = `A garment is described as: '${text}'. For a dry cleaning business, infer its brand, type, material, care instruction ('Laundry' or 'Dry Clean'), and suggest a reasonable cleaning price in USD. Also, identify any problems mentioned. Set color to 'N/A' and frameIndex to 0. Provide the output in the specified JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: garmentSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as GarmentDetails;

  } catch (error) {
    console.error("Error analyzing garment text:", error);
    throw new Error("Failed to analyze text with Gemini API. Please check the console for more details.");
  }
}

export async function analyzeGarmentByBarcode(barcode: string): Promise<GarmentDetails> {
  const prompt = `A garment is identified by barcode: '${barcode}'. For a dry cleaning business, find its brand, item type, material, recommended care instruction ('Laundry' or 'Dry Clean'), and suggest a cleaning price in USD. Set color to 'N/A' and frameIndex to 0. Since problems cannot be visually assessed, return an empty array for the problems field. Provide the output in the specified JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: garmentSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as GarmentDetails;

  } catch (error) {
    console.error("Error analyzing garment barcode:", error);
    throw new Error("Failed to analyze barcode with Gemini API. Please check the console for more details.");
  }
}