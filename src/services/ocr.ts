import { createWorker } from 'tesseract.js';

export async function extractTextFromImage(imageFile: File): Promise<string> {
  console.log('Starting OCR for image:', imageFile.name);
  
  const worker = await createWorker('ita');
  
  try {
    console.log('OCR worker created');
    const { data: { text } } = await worker.recognize(imageFile);
    console.log('Text extracted, length:', text.length);
    return text;
  } catch (error) {
    console.error('OCR error:', error);
    throw error;
  } finally {
    await worker.terminate();
    console.log('OCR worker terminated');
  }
}