import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
} from 'docx';

const execPromise = promisify(exec);

export const config = {
  api: {
    bodyParser: true,
    sizeLimit: '10mb',
  },
};

interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

interface Education {
  degree: string;
  school: string;
  year: string;
}

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  template: string;
}

// Professional template - clean blue theme
function createProfessionalResume(data: ResumeData): Document {
  const sections: Paragraph[] = [];

  // Name
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.fullName || 'Your Name',
          bold: true,
          size: 56,
          color: '1E40AF',
          font: 'Calibri',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  // Contact info
  const contactParts = [data.email, data.phone, data.location].filter(Boolean);
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: contactParts.join('  •  ') || 'email@example.com • +1 (555) 000-0000 • City, State',
          size: 22,
          color: '666666',
          font: 'Calibri',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 12, color: '1E40AF' },
      },
    })
  );

  // Summary
  if (data.summary) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROFESSIONAL SUMMARY',
            bold: true,
            size: 26,
            color: '1E40AF',
            font: 'Calibri',
          }),
        ],
        spacing: { before: 300, after: 100 },
      })
    );
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: data.summary,
            size: 22,
            color: '333333',
            font: 'Calibri',
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Experience
  const validExperience = data.experience.filter(exp => exp.company || exp.role);
  if (validExperience.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'WORK EXPERIENCE',
            bold: true,
            size: 26,
            color: '1E40AF',
            font: 'Calibri',
          }),
        ],
        spacing: { before: 300, after: 100 },
      })
    );

    validExperience.forEach(exp => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.role || 'Job Title',
              bold: true,
              size: 24,
              color: '1a202c',
              font: 'Calibri',
            }),
            new TextRun({
              text: `    ${exp.duration || ''}`,
              size: 22,
              color: '666666',
              font: 'Calibri',
            }),
          ],
          spacing: { before: 150 },
        })
      );
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.company || 'Company Name',
              italics: true,
              size: 22,
              color: '1E40AF',
              font: 'Calibri',
            }),
          ],
        })
      );
      if (exp.description) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.description,
                size: 22,
                color: '333333',
                font: 'Calibri',
              }),
            ],
            spacing: { after: 150 },
          })
        );
      }
    });
  }

  // Education
  const validEducation = data.education.filter(edu => edu.school || edu.degree);
  if (validEducation.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 26,
            color: '1E40AF',
            font: 'Calibri',
          }),
        ],
        spacing: { before: 300, after: 100 },
      })
    );

    validEducation.forEach(edu => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree || 'Degree',
              bold: true,
              size: 24,
              color: '1a202c',
              font: 'Calibri',
            }),
            new TextRun({
              text: `    ${edu.year || ''}`,
              size: 22,
              color: '666666',
              font: 'Calibri',
            }),
          ],
          spacing: { before: 100 },
        })
      );
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.school || 'School/University',
              size: 22,
              color: '333333',
              font: 'Calibri',
            }),
          ],
          spacing: { after: 100 },
        })
      );
    });
  }

  // Skills
  if (data.skills.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'SKILLS',
            bold: true,
            size: 26,
            color: '1E40AF',
            font: 'Calibri',
          }),
        ],
        spacing: { before: 300, after: 100 },
      })
    );
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: data.skills.join('  •  '),
            size: 22,
            color: '333333',
            font: 'Calibri',
          }),
        ],
      })
    );
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: sections,
      },
    ],
  });
}

// Modern template - purple gradient style
function createModernResume(data: ResumeData): Document {
  const sections: Paragraph[] = [];

  // Header with purple background effect (simulated with colored text)
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.fullName || 'Your Name',
          bold: true,
          size: 60,
          color: '7C3AED',
          font: 'Arial',
        }),
      ],
      spacing: { after: 100 },
    })
  );

  const contactParts = [data.email, data.phone, data.location].filter(Boolean);
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: contactParts.join('  •  ') || 'email@example.com • +1 (555) 000-0000 • City, State',
          size: 22,
          color: '8B5CF6',
          font: 'Arial',
        }),
      ],
      spacing: { after: 300 },
      border: {
        bottom: { style: BorderStyle.THICK, size: 24, color: '7C3AED' },
      },
    })
  );

  // Summary
  if (data.summary) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '▸ About Me',
            bold: true,
            size: 28,
            color: '7C3AED',
            font: 'Arial',
          }),
        ],
        spacing: { before: 300, after: 100 },
      })
    );
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: data.summary,
            size: 22,
            color: '374151',
            font: 'Arial',
          }),
        ],
        indent: { left: 200 },
        spacing: { after: 200 },
      })
    );
  }

  // Experience
  const validExperience = data.experience.filter(exp => exp.company || exp.role);
  if (validExperience.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '▸ Work Experience',
            bold: true,
            size: 28,
            color: '7C3AED',
            font: 'Arial',
          }),
        ],
        spacing: { before: 300, after: 100 },
      })
    );

    validExperience.forEach(exp => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.role || 'Job Title',
              bold: true,
              size: 24,
              color: '1F2937',
              font: 'Arial',
            }),
          ],
          indent: { left: 200 },
          spacing: { before: 150 },
        })
      );
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.company || 'Company Name',
              size: 22,
              color: '7C3AED',
              font: 'Arial',
            }),
            new TextRun({
              text: `  •  ${exp.duration || ''}`,
              size: 20,
              color: '6B7280',
              font: 'Arial',
            }),
          ],
          indent: { left: 200 },
        })
      );
      if (exp.description) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.description,
                size: 22,
                color: '374151',
                font: 'Arial',
              }),
            ],
            indent: { left: 200 },
            spacing: { after: 150 },
          })
        );
      }
    });
  }

  // Education
  const validEducation = data.education.filter(edu => edu.school || edu.degree);
  if (validEducation.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '▸ Education',
            bold: true,
            size: 28,
            color: '7C3AED',
            font: 'Arial',
          }),
        ],
        spacing: { before: 300, after: 100 },
      })
    );

    validEducation.forEach(edu => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree || 'Degree',
              bold: true,
              size: 24,
              color: '1F2937',
              font: 'Arial',
            }),
          ],
          indent: { left: 200 },
          spacing: { before: 100 },
        })
      );
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.school || 'School',
              size: 22,
              color: '374151',
              font: 'Arial',
            }),
            new TextRun({
              text: `  •  ${edu.year || ''}`,
              size: 20,
              color: '6B7280',
              font: 'Arial',
            }),
          ],
          indent: { left: 200 },
          spacing: { after: 100 },
        })
      );
    });
  }

  // Skills
  if (data.skills.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '▸ Skills',
            bold: true,
            size: 28,
            color: '7C3AED',
            font: 'Arial',
          }),
        ],
        spacing: { before: 300, after: 100 },
      })
    );
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: data.skills.join('  |  '),
            size: 22,
            color: '374151',
            font: 'Arial',
          }),
        ],
        indent: { left: 200 },
      })
    );
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: sections,
      },
    ],
  });
}

// Creative template - teal accent style
function createCreativeResume(data: ResumeData): Document {
  const sections: Paragraph[] = [];

  // Name with teal color
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.fullName || 'Your Name',
          bold: true,
          size: 52,
          color: '0D9488',
          font: 'Georgia',
        }),
      ],
      spacing: { after: 50 },
    })
  );

  // Contact
  const contactParts = [data.email, data.phone, data.location].filter(Boolean);
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: contactParts.join('  |  ') || 'email@example.com | +1 (555) 000-0000 | City, State',
          size: 20,
          color: '6B7280',
          font: 'Georgia',
        }),
      ],
      spacing: { after: 200 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 8, color: '0D9488' },
      },
    })
  );

  // Summary
  if (data.summary) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROFILE',
            bold: true,
            size: 26,
            color: '0D9488',
            font: 'Georgia',
          }),
        ],
        spacing: { before: 300, after: 100 },
        border: {
          left: { style: BorderStyle.THICK, size: 24, color: '0D9488' },
        },
        indent: { left: 200 },
      })
    );
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: data.summary,
            size: 22,
            color: '374151',
            font: 'Georgia',
          }),
        ],
        indent: { left: 200 },
        spacing: { after: 200 },
      })
    );
  }

  // Experience
  const validExperience = data.experience.filter(exp => exp.company || exp.role);
  if (validExperience.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EXPERIENCE',
            bold: true,
            size: 26,
            color: '0D9488',
            font: 'Georgia',
          }),
        ],
        spacing: { before: 300, after: 100 },
        border: {
          left: { style: BorderStyle.THICK, size: 24, color: '0D9488' },
        },
        indent: { left: 200 },
      })
    );

    validExperience.forEach(exp => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.role || 'Job Title',
              bold: true,
              size: 22,
              color: '1F2937',
              font: 'Georgia',
            }),
            new TextRun({
              text: `  (${exp.duration || ''})`,
              size: 20,
              color: '6B7280',
              font: 'Georgia',
            }),
          ],
          indent: { left: 200 },
          spacing: { before: 150 },
        })
      );
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.company || 'Company',
              size: 22,
              color: '0D9488',
              font: 'Georgia',
            }),
          ],
          indent: { left: 200 },
        })
      );
      if (exp.description) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.description,
                size: 20,
                color: '374151',
                font: 'Georgia',
              }),
            ],
            indent: { left: 200 },
            spacing: { after: 150 },
          })
        );
      }
    });
  }

  // Education
  const validEducation = data.education.filter(edu => edu.school || edu.degree);
  if (validEducation.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'EDUCATION',
            bold: true,
            size: 26,
            color: '0D9488',
            font: 'Georgia',
          }),
        ],
        spacing: { before: 300, after: 100 },
        border: {
          left: { style: BorderStyle.THICK, size: 24, color: '0D9488' },
        },
        indent: { left: 200 },
      })
    );

    validEducation.forEach(edu => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree || 'Degree',
              bold: true,
              size: 22,
              color: '1F2937',
              font: 'Georgia',
            }),
          ],
          indent: { left: 200 },
          spacing: { before: 100 },
        })
      );
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.school || 'School',
              size: 20,
              color: '374151',
              font: 'Georgia',
            }),
            new TextRun({
              text: `  •  ${edu.year || ''}`,
              size: 20,
              color: '6B7280',
              font: 'Georgia',
            }),
          ],
          indent: { left: 200 },
          spacing: { after: 100 },
        })
      );
    });
  }

  // Skills
  if (data.skills.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'SKILLS',
            bold: true,
            size: 26,
            color: '0D9488',
            font: 'Georgia',
          }),
        ],
        spacing: { before: 300, after: 100 },
        border: {
          left: { style: BorderStyle.THICK, size: 24, color: '0D9488' },
        },
        indent: { left: 200 },
      })
    );
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: data.skills.join('  •  '),
            size: 20,
            color: '374151',
            font: 'Georgia',
          }),
        ],
        indent: { left: 200 },
      })
    );
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
        },
        children: sections,
      },
    ],
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data: ResumeData = req.body;

    // Create document based on template
    let doc: Document;
    switch (data.template) {
      case 'modern':
        doc = createModernResume(data);
        break;
      case 'creative':
        doc = createCreativeResume(data);
        break;
      default:
        doc = createProfessionalResume(data);
    }

    // Generate DOCX buffer
    const docxBuffer = await Packer.toBuffer(doc);

    // Create temp directory
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save DOCX temporarily
    const timestamp = Date.now();
    const docxPath = path.join(tempDir, `resume_${timestamp}.docx`);
    fs.writeFileSync(docxPath, docxBuffer);

    // Convert to PDF using LibreOffice
    try {
      await execPromise(`soffice --headless --convert-to pdf --outdir "${tempDir}" "${docxPath}"`, {
        timeout: 30000,
      });

      const pdfPath = docxPath.replace('.docx', '.pdf');

      if (fs.existsSync(pdfPath)) {
        const pdfBuffer = fs.readFileSync(pdfPath);

        // Clean up
        fs.unlinkSync(docxPath);
        fs.unlinkSync(pdfPath);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${data.fullName || 'resume'}_CV.pdf"`);
        return res.status(200).send(pdfBuffer);
      }
    } catch (conversionError) {
      console.error('LibreOffice conversion error:', conversionError);
    }

    // Fallback: return DOCX if PDF conversion fails
    fs.unlinkSync(docxPath);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${data.fullName || 'resume'}_CV.docx"`);
    return res.status(200).send(docxBuffer);

  } catch (error) {
    console.error('Error generating resume:', error);
    res.status(500).json({ error: 'Failed to generate resume' });
  }
}
