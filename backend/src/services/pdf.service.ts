import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { IAssignment } from '../models/assignment.model';
import { GeneratedPaperType, QuestionType, SectionType } from '../validators/ai.validator';
import { logger } from '../utils/logger';


export class PDFService {
  private readonly UPLOAD_DIR: string;

  constructor(uploadDir?: string) {
    this.UPLOAD_DIR = uploadDir || path.join(process.cwd(), 'public', 'uploads', 'pdfs');
    this.ensureDir();
  }

  private async ensureDir() {
    await fs.mkdir(this.UPLOAD_DIR, { recursive: true });
  }

  async generate(assignment: IAssignment, paper: GeneratedPaperType): Promise<string> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    let y = height - 50;
    const margin = 50;

    // --- Header ---
    const drawCenteredText = (text: string, size: number, f = font) => {
      const textWidth = f.widthOfTextAtSize(text, size);
      page.drawText(text, {
        x: (width - textWidth) / 2,
        y: y,
        size,
        font: f,
        color: rgb(0, 0, 0),
      });
      y -= size + 10;
    };

    drawCenteredText('Delhi Public School, Sector-4, Bokaro', 18, boldFont);
    drawCenteredText(`Subject: ${assignment.title}`, 14, boldFont);
    drawCenteredText(`Class: ${assignment.instructions?.includes('Class') ? '' : '5th'}`, 14, boldFont); // Defaulting to 5th as per image
    y -= 10;

    // --- Meta Info ---
    page.drawText('Time Allowed: 45 minutes', { x: margin, y, size: 10, font: boldFont });
    const marksText = `Maximum Marks: ${assignment.totalMarks || 20}`;
    const marksWidth = boldFont.widthOfTextAtSize(marksText, 10);
    page.drawText(marksText, { x: width - margin - marksWidth, y, size: 10, font: boldFont });
    y -= 30;

    page.drawText('All questions are compulsory unless stated otherwise.', { x: margin, y, size: 10, font: boldFont });
    y -= 30;

    // --- Student Info Block ---
    const drawInputLine = (label: string, length: number) => {
      page.drawText(label, { x: margin, y, size: 10, font: boldFont });
      const labelWidth = boldFont.widthOfTextAtSize(label, 10);
      page.drawLine({
        start: { x: margin + labelWidth + 5, y: y - 2 },
        end: { x: margin + labelWidth + length, y: y - 2 },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      y -= 20;
    };

    drawInputLine('Name: ', 150);
    drawInputLine('Roll Number: ', 150);
    drawInputLine('Class: 5th Section: ', 100);
    y -= 30;

    // --- Content ---
    for (const section of paper.sections) {
      // Check for page overflow
      if (y < 100) { page = pdfDoc.addPage([595.28, 841.89]); y = height - 50; }

      drawCenteredText(section.title, 14, boldFont);
      if (section.instruction) {
        page.drawText(section.instruction, { x: margin, y, size: 10, font });
        y -= 20;
      }
      y -= 10;

      section.questions.forEach((q: QuestionType, i: number) => {
        if (y < 100) { page = pdfDoc.addPage([595.28, 841.89]); y = height - 50; }

        const qText = `${i + 1}. [${q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}] ${q.text} [${q.marks} Marks]`;
        
        // Very basic wrapping
        const words = qText.split(' ');
        let line = '';
        words.forEach(word => {
          const testLine = line + word + ' ';
          if (font.widthOfTextAtSize(testLine, 10) > (width - 2 * margin)) {
            page.drawText(line, { x: margin, y, size: 10, font });
            y -= 15;
            line = '   ' + word + ' ';
          } else {
            line = testLine;
          }
        });
        page.drawText(line, { x: margin, y, size: 10, font });
        y -= 25;
      });
      y -= 20;
    }

    page.drawText('End of Question Paper', { x: margin, y, size: 10, font: boldFont });

    // --- Answer Key Page ---
    page = pdfDoc.addPage([595.28, 841.89]);
    y = height - 50;
    drawCenteredText('Answer Key', 16, boldFont);
    y -= 20;

    paper.sections.forEach((section: SectionType) => {
      section.questions.forEach((q: QuestionType, i: number) => {
        if (y < 100) { page = pdfDoc.addPage([595.28, 841.89]); y = height - 50; }
        
        const aText = `${i + 1}. ${q.answerKey}`;
        const words = aText.split(' ');
        let line = '';
        words.forEach(word => {
          const testLine = line + word + ' ';
          if (font.widthOfTextAtSize(testLine, 10) > (width - 2 * margin)) {
            page.drawText(line, { x: margin, y, size: 10, font });
            y -= 15;
            line = '   ' + word + ' ';
          } else {
            line = testLine;
          }
        });
        page.drawText(line, { x: margin, y, size: 10, font });
        y -= 20;
      });
    });

    const pdfBytes = await pdfDoc.save();
    const fileName = `assignment-${assignment._id}-${Date.now()}.pdf`;
    const filePath = path.join(this.UPLOAD_DIR, fileName);
    
    await fs.writeFile(filePath, pdfBytes);
    logger.info(`PDF generated successfully: ${filePath}`);

    return `/uploads/pdfs/${fileName}`; // Return relative URL
  }
}

export const pdfService = new PDFService();

