import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { pdf } from '@react-pdf/renderer';
import { ReactElement } from 'react';

interface PDFGeneratorOptions {
  filename: string;
  onProgress?: (progress: number) => void;
}

export async function generatePDF(
  elementId: string,
  options: PDFGeneratorOptions
): Promise<void> {
  const { filename, onProgress } = options;

  try {
    if (onProgress) onProgress(10);

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Elemento não encontrado');
    }

    if (onProgress) onProgress(30);

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    if (onProgress) onProgress(60);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    let heightLeft = imgHeight * ratio;
    let position = 0;
    let pageCount = 0;

    pdf.addImage(
      imgData,
      'PNG',
      imgX,
      imgY,
      imgWidth * ratio,
      imgHeight * ratio
    );

    heightLeft -= pdfHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight * ratio;
      pdf.addPage();
      pageCount++;
      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        position,
        imgWidth * ratio,
        imgHeight * ratio
      );
      heightLeft -= pdfHeight;
    }

    if (onProgress) onProgress(90);

    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(9);
      pdf.setTextColor(150);
      pdf.text(
        `Página ${i} de ${totalPages}`,
        pdfWidth / 2,
        pdfHeight - 10,
        { align: 'center' }
      );
    }

    if (onProgress) onProgress(100);

    pdf.save(filename);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
}

export function formatDateForFilename(date: string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function sanitizeFilename(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function generatePDFFromReactElement(
  pdfDocument: ReactElement,
  options: PDFGeneratorOptions
): Promise<void> {
  const { filename, onProgress } = options;

  try {
    if (onProgress) onProgress(10);

    if (onProgress) onProgress(30);

    const blob = await pdf(pdfDocument).toBlob();

    if (onProgress) onProgress(80);

    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);

    if (onProgress) onProgress(100);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
}
