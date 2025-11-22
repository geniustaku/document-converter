import React, { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: { company: string; role: string; duration: string; description: string }[];
  education: { school: string; degree: string; year: string }[];
  skills: string[];
}

// Color themes
const colorThemes = {
  blue: { primary: '#2563eb', secondary: '#1e40af', light: '#dbeafe', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
  purple: { primary: '#7c3aed', secondary: '#5b21b6', light: '#ede9fe', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
  teal: { primary: '#0d9488', secondary: '#115e59', light: '#ccfbf1', gradient: 'linear-gradient(180deg, #0d9488 0%, #115e59 100%)' },
  red: { primary: '#dc2626', secondary: '#991b1b', light: '#fee2e2', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
  green: { primary: '#16a34a', secondary: '#15803d', light: '#dcfce7', gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' },
  orange: { primary: '#ea580c', secondary: '#c2410c', light: '#ffedd5', gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' },
  pink: { primary: '#db2777', secondary: '#be185d', light: '#fce7f3', gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' },
  slate: { primary: '#475569', secondary: '#334155', light: '#f1f5f9', gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)' },
};

export default function ResumeBuilder() {
  const [template, setTemplate] = useState<'professional' | 'modern' | 'creative'>('creative');
  const [accentColor, setAccentColor] = useState<keyof typeof colorThemes>('slate');
  const [resumeData, setResumeData] = useState<ResumeData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    experience: [{ company: '', role: '', duration: '', description: '' }],
    education: [{ school: '', degree: '', year: '' }],
    skills: []
  });
  const [skillInput, setSkillInput] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const theme = colorThemes[accentColor];

  // Common input styles with BLACK text - larger for mobile
  const inputStyles = {
    color: '#000000',
    backgroundColor: '#ffffff',
    fontSize: '16px',
    fontWeight: '500' as const,
    minHeight: '48px',
  };

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, { company: '', role: '', duration: '', description: '' }]
    });
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, { school: '', degree: '', year: '' }]
    });
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((_, i) => i !== index)
    });
  };

  // Export EXACT preview as PDF - properly handles multi-page
  const exportPreviewPDF = async () => {
    setIsExporting(true);

    if (!resumeRef.current) {
      setIsExporting(false);
      return;
    }

    try {
      // Get the parent container that has the maxHeight restriction
      const parentContainer = resumeRef.current.parentElement;

      // Store original styles
      const originalTransform = resumeRef.current.style.transform;
      const originalParentMaxHeight = parentContainer?.style.maxHeight || '';
      const originalParentOverflow = parentContainer?.style.overflow || '';

      // Remove restrictions temporarily
      resumeRef.current.style.transform = 'none';
      if (parentContainer) {
        parentContainer.style.maxHeight = 'none';
        parentContainer.style.overflow = 'visible';
      }

      // Wait for reflow
      await new Promise(resolve => setTimeout(resolve, 150));

      // Get actual full dimensions
      const fullWidth = resumeRef.current.scrollWidth;
      const fullHeight = resumeRef.current.scrollHeight;

      // Capture the full content at high quality
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: fullWidth,
        height: fullHeight,
        windowWidth: fullWidth,
        windowHeight: fullHeight,
      });

      // Restore original styles
      resumeRef.current.style.transform = originalTransform;
      if (parentContainer) {
        parentContainer.style.maxHeight = originalParentMaxHeight;
        parentContainer.style.overflow = originalParentOverflow;
      }

      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;

      // Canvas dimensions
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Calculate total height in mm when scaled to A4 width
      const totalHeightMM = (canvasHeight * pdfWidth) / canvasWidth;

      // Calculate number of pages needed
      const totalPages = Math.ceil(totalHeightMM / pdfHeight);

      const pdf = new jsPDF('p', 'mm', 'a4');

      // Height of one A4 page in canvas pixels
      const pageHeightPx = (pdfHeight * canvasWidth) / pdfWidth;

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        // Calculate source Y position and height for this page slice
        const srcY = page * pageHeightPx;
        const srcHeight = Math.min(pageHeightPx, canvasHeight - srcY);

        if (srcHeight <= 0) continue;

        // Create a canvas for this page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = srcHeight;

        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          // Draw the slice from the full canvas
          ctx.drawImage(
            canvas,
            0, srcY, canvasWidth, srcHeight,  // source
            0, 0, canvasWidth, srcHeight       // destination
          );

          const imgData = pageCanvas.toDataURL('image/png', 1.0);
          const imgHeightMM = (srcHeight * pdfWidth) / canvasWidth;

          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeightMM);
        }
      }

      pdf.save(`${resumeData.fullName || 'resume'}_CV.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export as editable DOCX (Word document)
  const exportDOCX = async () => {
    setIsExporting(true);

    try {
      const response = await fetch('/api/resume-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...resumeData, template: template }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const contentType = response.headers.get('content-type');
        const ext = contentType?.includes('pdf') ? 'pdf' : 'docx';
        link.download = `${resumeData.fullName || 'resume'}_CV.${ext}`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        alert('Failed to generate document. Please try again.');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const renderResume = () => {
    const baseStyles = 'bg-white shadow-lg';

    if (template === 'professional') {
      return (
        <div className={`${baseStyles} font-serif`} style={{ minHeight: '842px', width: '595px', padding: '40px', fontSize: '11px' }}>
          <div style={{ borderBottom: `2px solid ${theme.primary}`, paddingBottom: '12px', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '4px', color: '#1a202c' }}>{resumeData.fullName || 'Your Name'}</h1>
            <div style={{ fontSize: '10px', color: '#4a5568', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span>{resumeData.email || 'email@example.com'}</span>
              <span>•</span>
              <span>{resumeData.phone || '+1 (555) 000-0000'}</span>
              <span>•</span>
              <span>{resumeData.location || 'City, State'}</span>
            </div>
          </div>

          {resumeData.summary && (
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase', color: theme.primary, letterSpacing: '0.5px' }}>Professional Summary</h2>
              <p style={{ fontSize: '10px', lineHeight: '1.5', color: '#374151' }}>{resumeData.summary}</p>
            </div>
          )}

          {resumeData.experience.some(exp => exp.company) && (
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', color: theme.primary, letterSpacing: '0.5px' }}>Experience</h2>
              {resumeData.experience.map((exp, idx) => (
                exp.company && (
                  <div key={idx} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                      <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#1a202c' }}>{exp.role}</h3>
                      <span style={{ fontSize: '9px', color: '#6b7280' }}>{exp.duration}</span>
                    </div>
                    <p style={{ fontSize: '10px', fontStyle: 'italic', marginBottom: '2px', color: '#374151' }}>{exp.company}</p>
                    <p style={{ fontSize: '9px', lineHeight: '1.4', color: '#374151' }}>{exp.description}</p>
                  </div>
                )
              ))}
            </div>
          )}

          {resumeData.education.some(edu => edu.school) && (
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', color: theme.primary, letterSpacing: '0.5px' }}>Education</h2>
              {resumeData.education.map((edu, idx) => (
                edu.school && (
                  <div key={idx} style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#1a202c' }}>{edu.degree}</h3>
                        <p style={{ fontSize: '10px', color: '#374151' }}>{edu.school}</p>
                      </div>
                      <span style={{ fontSize: '9px', color: '#6b7280' }}>{edu.year}</span>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {resumeData.skills.length > 0 && (
            <div>
              <h2 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', color: theme.primary, letterSpacing: '0.5px' }}>Skills</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {resumeData.skills.map((skill, idx) => (
                  <span key={idx} style={{ padding: '2px 8px', fontSize: '9px', borderRadius: '3px', backgroundColor: theme.light, color: theme.secondary }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (template === 'modern') {
      return (
        <div className={baseStyles} style={{ minHeight: '842px', width: '595px', fontSize: '11px' }}>
          <div style={{ padding: '20px 40px', marginBottom: '16px', background: theme.gradient }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px', color: '#ffffff' }}>{resumeData.fullName || 'Your Name'}</h1>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span>{resumeData.email || 'email@example.com'}</span>
              <span>•</span>
              <span>{resumeData.phone || '+1 (555) 000-0000'}</span>
              <span>•</span>
              <span>{resumeData.location || 'City, State'}</span>
            </div>
          </div>

          <div style={{ padding: '0 40px 40px' }}>
            {resumeData.summary && (
              <div style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', color: theme.primary, display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '3px', height: '14px', marginRight: '6px', backgroundColor: theme.primary }}></span>
                  About Me
                </h2>
                <p style={{ fontSize: '10px', lineHeight: '1.5', color: '#374151', marginLeft: '9px' }}>{resumeData.summary}</p>
              </div>
            )}

            {resumeData.experience.some(exp => exp.company) && (
              <div style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: theme.primary, display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '3px', height: '14px', marginRight: '6px', backgroundColor: theme.primary }}></span>
                  Work Experience
                </h2>
                {resumeData.experience.map((exp, idx) => (
                  exp.company && (
                    <div key={idx} style={{ marginBottom: '10px', marginLeft: '9px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                        <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#1a202c' }}>{exp.role}</h3>
                        <span style={{ fontSize: '8px', padding: '2px 6px', borderRadius: '3px', backgroundColor: '#f3f4f6', color: '#6b7280' }}>{exp.duration}</span>
                      </div>
                      <p style={{ fontSize: '10px', fontWeight: '600', marginBottom: '2px', color: theme.primary }}>{exp.company}</p>
                      <p style={{ fontSize: '9px', lineHeight: '1.4', color: '#374151' }}>{exp.description}</p>
                    </div>
                  )
                ))}
              </div>
            )}

            {resumeData.education.some(edu => edu.school) && (
              <div style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: theme.primary, display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '3px', height: '14px', marginRight: '6px', backgroundColor: theme.primary }}></span>
                  Education
                </h2>
                {resumeData.education.map((edu, idx) => (
                  edu.school && (
                    <div key={idx} style={{ marginBottom: '6px', marginLeft: '9px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#1a202c' }}>{edu.degree}</h3>
                          <p style={{ fontSize: '10px', color: '#374151' }}>{edu.school}</p>
                        </div>
                        <span style={{ fontSize: '8px', padding: '2px 6px', borderRadius: '3px', backgroundColor: '#f3f4f6', color: '#6b7280' }}>{edu.year}</span>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}

            {resumeData.skills.length > 0 && (
              <div>
                <h2 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: theme.primary, display: 'flex', alignItems: 'center' }}>
                  <span style={{ width: '3px', height: '14px', marginRight: '6px', backgroundColor: theme.primary }}></span>
                  Skills
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginLeft: '9px' }}>
                  {resumeData.skills.map((skill, idx) => (
                    <span key={idx} style={{ padding: '2px 8px', fontSize: '8px', borderRadius: '10px', background: theme.gradient, color: '#ffffff' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Creative template
    return (
      <div className={baseStyles} style={{ minHeight: '842px', width: '595px', display: 'grid', gridTemplateColumns: '160px 1fr', fontSize: '10px' }}>
        <div style={{ padding: '24px 16px', background: theme.gradient }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold', backgroundColor: '#ffffff', color: theme.primary }}>
              {(resumeData.fullName || 'Y')[0].toUpperCase()}
            </div>
            <h2 style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '10px', paddingBottom: '6px', color: '#ffffff', borderBottom: `1px solid ${theme.light}`, letterSpacing: '1px' }}>CONTACT</h2>
            <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.85)' }}>
              <p style={{ marginBottom: '4px', wordBreak: 'break-word' }}>{resumeData.email || 'email@example.com'}</p>
              <p style={{ marginBottom: '4px' }}>{resumeData.phone || '+1 (555) 000-0000'}</p>
              <p>{resumeData.location || 'City, State'}</p>
            </div>
          </div>

          {resumeData.skills.length > 0 && (
            <div>
              <h2 style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', paddingBottom: '6px', color: '#ffffff', borderBottom: `1px solid ${theme.light}`, letterSpacing: '1px' }}>SKILLS</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {resumeData.skills.map((skill, idx) => (
                  <div key={idx} style={{ padding: '3px 6px', fontSize: '8px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}>
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '24px 20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '2px', color: theme.primary }}>{resumeData.fullName || 'Your Name'}</h1>
          <p style={{ marginBottom: '14px', fontSize: '9px', color: '#6b7280' }}>Professional</p>

          {resumeData.summary && (
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', paddingBottom: '3px', color: theme.primary, borderBottom: `2px solid ${theme.primary}`, letterSpacing: '0.5px' }}>PROFILE</h2>
              <p style={{ fontSize: '9px', lineHeight: '1.5', color: '#374151' }}>{resumeData.summary}</p>
            </div>
          )}

          {resumeData.experience.some(exp => exp.company) && (
            <div style={{ marginBottom: '14px' }}>
              <h2 style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', paddingBottom: '3px', color: theme.primary, borderBottom: `2px solid ${theme.primary}`, letterSpacing: '0.5px' }}>EXPERIENCE</h2>
              {resumeData.experience.map((exp, idx) => (
                exp.company && (
                  <div key={idx} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1px' }}>
                      <h3 style={{ fontSize: '10px', fontWeight: 'bold', color: '#1a202c' }}>{exp.role}</h3>
                      <span style={{ fontSize: '8px', color: '#6b7280' }}>{exp.duration}</span>
                    </div>
                    <p style={{ fontSize: '9px', fontWeight: '600', marginBottom: '2px', color: theme.primary }}>{exp.company}</p>
                    <p style={{ fontSize: '8px', lineHeight: '1.4', color: '#374151' }}>{exp.description}</p>
                  </div>
                )
              ))}
            </div>
          )}

          {resumeData.education.some(edu => edu.school) && (
            <div>
              <h2 style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', paddingBottom: '3px', color: theme.primary, borderBottom: `2px solid ${theme.primary}`, letterSpacing: '0.5px' }}>EDUCATION</h2>
              {resumeData.education.map((edu, idx) => (
                edu.school && (
                  <div key={idx} style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '10px', fontWeight: 'bold', color: '#1a202c' }}>{edu.degree}</h3>
                        <p style={{ fontSize: '8px', color: '#374151' }}>{edu.school}</p>
                      </div>
                      <span style={{ fontSize: '8px', color: '#6b7280' }}>{edu.year}</span>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Free Resume Builder Online - Create Professional CV & Download PDF 2025</title>
        <meta name="description" content="Create stunning professional resumes for free in minutes. ATS-friendly templates, instant PDF download, no sign-up required. Build your perfect CV with our easy-to-use online resume maker." />
        <meta name="keywords" content="free resume builder, cv maker online, resume creator, professional resume template, ATS resume builder, cv builder free, resume maker, create resume online, download resume PDF, job resume builder 2025" />
        <link rel="canonical" href="https://document-converter-pro.vercel.app/resume-builder" />
        <meta property="og:title" content="Free Resume Builder - Create Professional CV Online in Minutes" />
        <meta property="og:description" content="Build ATS-friendly resumes with beautiful templates. Download as PDF or Word. Free, fast, no sign-up. Perfect for job seekers." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://document-converter-pro.vercel.app/resume-builder" />
        <meta property="og:image" content="https://document-converter-pro.vercel.app/og-resume-builder.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Resume Builder - Create Professional CV Online" />
        <meta name="twitter:description" content="Build stunning resumes in minutes. ATS-friendly templates, PDF download, completely free." />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Document Converter Pro" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: '#1a202c' }}>Document Converter Pro</h1>
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '40px'
            }}>
              📄
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1a202c' }}>Professional Resume Builder</h1>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#4b5563' }}>Create stunning ATS-friendly resumes in minutes. Choose from professional templates and download as PDF.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 mb-12">
            {/* Editor Section */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 space-y-4 md:space-y-6 order-2 xl:order-1" style={{ maxHeight: 'none' }}>
              <div>
                <h2 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#1a202c' }}>Build Your Resume</h2>

                {/* Template Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Choose Template</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['professional', 'modern', 'creative'] as const).map((temp) => (
                      <button
                        key={temp}
                        onClick={() => setTemplate(temp)}
                        className={`p-2 rounded-lg border-2 capitalize text-sm ${template === temp ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        style={{ color: '#1a202c', fontWeight: 600 }}
                      >
                        {temp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>Accent Color</label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(colorThemes) as Array<keyof typeof colorThemes>).map((color) => (
                      <button
                        key={color}
                        onClick={() => setAccentColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${accentColor === color ? 'border-gray-800 ring-2 ring-offset-2' : 'border-gray-300'}`}
                        style={{ backgroundColor: colorThemes[color].primary }}
                        title={color.charAt(0).toUpperCase() + color.slice(1)}
                      />
                    ))}
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg" style={{ color: '#1a202c' }}>Personal Information</h3>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={resumeData.fullName}
                    onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    style={inputStyles}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={resumeData.email}
                    onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    style={inputStyles}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={resumeData.phone}
                    onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    style={inputStyles}
                  />
                  <input
                    type="text"
                    placeholder="Location (City, State)"
                    value={resumeData.location}
                    onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    style={inputStyles}
                  />
                </div>

                {/* Professional Summary */}
                <div className="space-y-3">
                  <h3 className="font-bold text-lg" style={{ color: '#1a202c' }}>Professional Summary</h3>
                  <textarea
                    placeholder="Brief overview of your professional background and career objectives..."
                    value={resumeData.summary}
                    onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    rows={4}
                    style={inputStyles}
                  />
                </div>

                {/* Experience */}
                <div className="space-y-3">
                  <h3 className="font-bold text-lg" style={{ color: '#1a202c' }}>Work Experience</h3>
                  {resumeData.experience.map((exp, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <input
                        type="text"
                        placeholder="Job Title"
                        value={exp.role}
                        onChange={(e) => {
                          const newExp = [...resumeData.experience];
                          newExp[idx].role = e.target.value;
                          setResumeData({ ...resumeData, experience: newExp });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        style={inputStyles}
                      />
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={exp.company}
                        onChange={(e) => {
                          const newExp = [...resumeData.experience];
                          newExp[idx].company = e.target.value;
                          setResumeData({ ...resumeData, experience: newExp });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        style={inputStyles}
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g., Jan 2020 - Present)"
                        value={exp.duration}
                        onChange={(e) => {
                          const newExp = [...resumeData.experience];
                          newExp[idx].duration = e.target.value;
                          setResumeData({ ...resumeData, experience: newExp });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        style={inputStyles}
                      />
                      <textarea
                        placeholder="Job description and achievements..."
                        value={exp.description}
                        onChange={(e) => {
                          const newExp = [...resumeData.experience];
                          newExp[idx].description = e.target.value;
                          setResumeData({ ...resumeData, experience: newExp });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        rows={3}
                        style={inputStyles}
                      />
                    </div>
                  ))}
                  <button
                    onClick={addExperience}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500"
                    style={{ color: '#4b5563' }}
                  >
                    + Add Experience
                  </button>
                </div>

                {/* Education */}
                <div className="space-y-3">
                  <h3 className="font-bold text-lg" style={{ color: '#1a202c' }}>Education</h3>
                  {resumeData.education.map((edu, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <input
                        type="text"
                        placeholder="Degree / Certification"
                        value={edu.degree}
                        onChange={(e) => {
                          const newEdu = [...resumeData.education];
                          newEdu[idx].degree = e.target.value;
                          setResumeData({ ...resumeData, education: newEdu });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        style={inputStyles}
                      />
                      <input
                        type="text"
                        placeholder="School / University"
                        value={edu.school}
                        onChange={(e) => {
                          const newEdu = [...resumeData.education];
                          newEdu[idx].school = e.target.value;
                          setResumeData({ ...resumeData, education: newEdu });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        style={inputStyles}
                      />
                      <input
                        type="text"
                        placeholder="Year (e.g., 2020)"
                        value={edu.year}
                        onChange={(e) => {
                          const newEdu = [...resumeData.education];
                          newEdu[idx].year = e.target.value;
                          setResumeData({ ...resumeData, education: newEdu });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        style={inputStyles}
                      />
                    </div>
                  ))}
                  <button
                    onClick={addEducation}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500"
                    style={{ color: '#4b5563' }}
                  >
                    + Add Education
                  </button>
                </div>

                {/* Skills */}
                <div className="space-y-3">
                  <h3 className="font-bold text-lg" style={{ color: '#1a202c' }}>Skills</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a skill"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      style={inputStyles}
                    />
                    <button
                      onClick={addSkill}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full flex items-center gap-2" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                        {skill}
                        <button
                          onClick={() => removeSkill(idx)}
                          className="font-bold"
                          style={{ color: '#2563eb' }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold" style={{ color: '#374151' }}>Download Options:</p>

                  {/* Download Exact Preview */}
                  <button
                    onClick={exportPreviewPDF}
                    disabled={isExporting || !resumeData.fullName}
                    className="w-full px-8 py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff'
                    }}
                  >
                    {isExporting ? 'Generating...' : '📷 Download Exact Preview as PDF'}
                  </button>

                  {/* Download Editable DOCX */}
                  <button
                    onClick={exportDOCX}
                    disabled={isExporting || !resumeData.fullName}
                    className="w-full px-8 py-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: '#ffffff'
                    }}
                  >
                    {isExporting ? 'Generating...' : '📝 Download as Word Document (DOCX)'}
                  </button>

                  <p className="text-xs text-center" style={{ color: '#6b7280' }}>
                    Preview PDF = exact visual copy | DOCX = editable in Word
                  </p>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-gray-100 rounded-2xl shadow-lg p-4 order-1 xl:order-2">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-center" style={{ color: '#1a202c' }}>Live Preview</h2>

              {/* Mobile preview message */}
              <div className="md:hidden text-center py-6 px-4">
                <p style={{ color: '#6b7280', marginBottom: '8px' }}>Preview is optimized for larger screens.</p>
                <p style={{ color: '#374151', fontWeight: 500 }}>Fill the form below and download your PDF.</p>
              </div>

              {/* Preview container - visible on desktop, hidden off-screen on mobile for PDF export */}
              <div className="flex justify-center overflow-auto md:overflow-visible" style={{ maxHeight: '600px' }}>
                <div
                  ref={resumeRef}
                  className="md:block"
                  style={{
                    transform: 'scale(0.7)',
                    transformOrigin: 'top center',
                  }}
                >
                  {renderResume()}
                </div>
              </div>
            </div>
          </div>

          <AdSenseAd adSlot="1313131313" adFormat="rectangle" style={{ display: 'block', width: '728px', height: '90px', margin: '0 auto' }} />
        </main>
      </div>
    </>
  );
}
