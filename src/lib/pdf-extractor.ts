// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

export type DocumentPage = {
  pageNumber: number;
  text: string;
};

export type ParsedDocument = {
  id: string;
  filename: string;
  pages: DocumentPage[];
};

export async function extractPdfText(filePath: string): Promise<DocumentPage[]> {
  const loadingTask = pdfjsLib.getDocument(filePath);
  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;
  const pages: DocumentPage[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    
    pages.push({
      pageNumber: i,
      text: pageText,
    });
  }

  return pages;
}
