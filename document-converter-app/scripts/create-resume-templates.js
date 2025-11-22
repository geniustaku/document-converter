const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

// Create a minimal DOCX template structure
function createDocxTemplate(content) {
  const zip = new PizZip();

  // [Content_Types].xml
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`);

  // _rels/.rels
  zip.folder('_rels').file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  // word/_rels/document.xml.rels
  zip.folder('word').folder('_rels').file('document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`);

  // word/styles.xml
  zip.folder('word').file('styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="Heading 1"/>
    <w:pPr><w:spacing w:after="120"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="48"/><w:color w:val="1E40AF"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="Heading 2"/>
    <w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="1E40AF"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr><w:sz w:val="22"/></w:rPr>
  </w:style>
</w:styles>`);

  // word/document.xml
  zip.folder('word').file('document.xml', content);

  return zip.generate({ type: 'nodebuffer' });
}

// Professional Template
const professionalTemplate = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <!-- Header with Name -->
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="56"/><w:color w:val="1E40AF"/></w:rPr>
        <w:t>{fullName}</w:t>
      </w:r>
    </w:p>

    <!-- Contact Info -->
    <w:p>
      <w:pPr><w:jc w:val="center"/><w:spacing w:after="200"/></w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="22"/><w:color w:val="666666"/></w:rPr>
        <w:t>{email}  •  {phone}  •  {location}</w:t>
      </w:r>
    </w:p>

    <!-- Horizontal Line -->
    <w:p>
      <w:pPr><w:pBdr><w:bottom w:val="single" w:sz="12" w:color="1E40AF"/></w:pBdr><w:spacing w:after="300"/></w:pPr>
    </w:p>

    <!-- Professional Summary -->
    {#hasSummary}
    <w:p>
      <w:pPr><w:spacing w:before="200"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="1E40AF"/></w:rPr>
        <w:t>PROFESSIONAL SUMMARY</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="200"/></w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="22"/></w:rPr>
        <w:t>{summary}</w:t>
      </w:r>
    </w:p>
    {/hasSummary}

    <!-- Experience Section -->
    {#hasExperience}
    <w:p>
      <w:pPr><w:spacing w:before="200"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="1E40AF"/></w:rPr>
        <w:t>WORK EXPERIENCE</w:t>
      </w:r>
    </w:p>
    {#experience}
    <w:p>
      <w:pPr><w:spacing w:before="150"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="24"/></w:rPr>
        <w:t>{role}</w:t>
      </w:r>
      <w:r>
        <w:rPr><w:sz w:val="22"/><w:color w:val="666666"/></w:rPr>
        <w:t>  |  {duration}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr><w:i/><w:sz w:val="22"/><w:color w:val="1E40AF"/></w:rPr>
        <w:t>{company}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="150"/></w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="22"/></w:rPr>
        <w:t>{description}</w:t>
      </w:r>
    </w:p>
    {/experience}
    {/hasExperience}

    <!-- Education Section -->
    {#hasEducation}
    <w:p>
      <w:pPr><w:spacing w:before="200"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="1E40AF"/></w:rPr>
        <w:t>EDUCATION</w:t>
      </w:r>
    </w:p>
    {#education}
    <w:p>
      <w:pPr><w:spacing w:before="100"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="24"/></w:rPr>
        <w:t>{degree}</w:t>
      </w:r>
      <w:r>
        <w:rPr><w:sz w:val="22"/><w:color w:val="666666"/></w:rPr>
        <w:t>  |  {year}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="100"/></w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="22"/></w:rPr>
        <w:t>{school}</w:t>
      </w:r>
    </w:p>
    {/education}
    {/hasEducation}

    <!-- Skills Section -->
    {#hasSkills}
    <w:p>
      <w:pPr><w:spacing w:before="200"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="1E40AF"/></w:rPr>
        <w:t>SKILLS</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr><w:sz w:val="22"/></w:rPr>
        <w:t>{skills}</w:t>
      </w:r>
    </w:p>
    {/hasSkills}

  </w:body>
</w:document>`;

// Modern Template
const modernTemplate = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <!-- Header with Name -->
    <w:p>
      <w:pPr><w:shd w:val="clear" w:fill="7C3AED"/><w:spacing w:after="0"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="60"/><w:color w:val="FFFFFF"/></w:rPr>
        <w:t>{fullName}</w:t>
      </w:r>
    </w:p>

    <!-- Contact Info -->
    <w:p>
      <w:pPr><w:shd w:val="clear" w:fill="7C3AED"/><w:spacing w:after="200"/></w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="22"/><w:color w:val="E9D5FF"/></w:rPr>
        <w:t>{email}  •  {phone}  •  {location}</w:t>
      </w:r>
    </w:p>

    <!-- Professional Summary -->
    {#hasSummary}
    <w:p>
      <w:pPr><w:spacing w:before="300"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="7C3AED"/></w:rPr>
        <w:t>▸ About Me</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="200"/><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="22"/></w:rPr>
        <w:t>{summary}</w:t>
      </w:r>
    </w:p>
    {/hasSummary}

    <!-- Experience Section -->
    {#hasExperience}
    <w:p>
      <w:pPr><w:spacing w:before="200"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="7C3AED"/></w:rPr>
        <w:t>▸ Work Experience</w:t>
      </w:r>
    </w:p>
    {#experience}
    <w:p>
      <w:pPr><w:spacing w:before="150"/><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="24"/></w:rPr>
        <w:t>{role}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="22"/><w:color w:val="7C3AED"/></w:rPr>
        <w:t>{company}</w:t>
      </w:r>
      <w:r>
        <w:rPr><w:sz w:val="20"/><w:color w:val="666666"/></w:rPr>
        <w:t>  •  {duration}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="150"/><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="22"/></w:rPr>
        <w:t>{description}</w:t>
      </w:r>
    </w:p>
    {/experience}
    {/hasExperience}

    <!-- Education Section -->
    {#hasEducation}
    <w:p>
      <w:pPr><w:spacing w:before="200"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="7C3AED"/></w:rPr>
        <w:t>▸ Education</w:t>
      </w:r>
    </w:p>
    {#education}
    <w:p>
      <w:pPr><w:spacing w:before="100"/><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="24"/></w:rPr>
        <w:t>{degree}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="100"/><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="22"/></w:rPr>
        <w:t>{school}</w:t>
      </w:r>
      <w:r>
        <w:rPr><w:sz w:val="20"/><w:color w:val="666666"/></w:rPr>
        <w:t>  •  {year}</w:t>
      </w:r>
    </w:p>
    {/education}
    {/hasEducation}

    <!-- Skills Section -->
    {#hasSkills}
    <w:p>
      <w:pPr><w:spacing w:before="200"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="7C3AED"/></w:rPr>
        <w:t>▸ Skills</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="22"/></w:rPr>
        <w:t>{skills}</w:t>
      </w:r>
    </w:p>
    {/hasSkills}

  </w:body>
</w:document>`;

// Creative Template
const creativeTemplate = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <!-- Header with Name -->
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="52"/><w:color w:val="0D9488"/></w:rPr>
        <w:t>{fullName}</w:t>
      </w:r>
    </w:p>

    <!-- Contact Info -->
    <w:p>
      <w:pPr><w:pBdr><w:bottom w:val="single" w:sz="8" w:color="0D9488"/></w:pBdr><w:spacing w:after="300"/></w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="20"/><w:color w:val="666666"/></w:rPr>
        <w:t>{email}  |  {phone}  |  {location}</w:t>
      </w:r>
    </w:p>

    <!-- Professional Summary -->
    {#hasSummary}
    <w:p>
      <w:pPr><w:spacing w:before="200"/><w:pBdr><w:left w:val="single" w:sz="24" w:color="0D9488"/></w:pBdr><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="0D9488"/></w:rPr>
        <w:t>PROFILE</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="200"/><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="22"/></w:rPr>
        <w:t>{summary}</w:t>
      </w:r>
    </w:p>
    {/hasSummary}

    <!-- Experience Section -->
    {#hasExperience}
    <w:p>
      <w:pPr><w:spacing w:before="200"/><w:pBdr><w:left w:val="single" w:sz="24" w:color="0D9488"/></w:pBdr><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="0D9488"/></w:rPr>
        <w:t>EXPERIENCE</w:t>
      </w:r>
    </w:p>
    {#experience}
    <w:p>
      <w:pPr><w:spacing w:before="150"/><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="22"/></w:rPr>
        <w:t>{role}</w:t>
      </w:r>
      <w:r>
        <w:rPr><w:sz w:val="20"/><w:color w:val="666666"/></w:rPr>
        <w:t>  ({duration})</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="22"/><w:color w:val="0D9488"/></w:rPr>
        <w:t>{company}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="150"/><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="20"/></w:rPr>
        <w:t>{description}</w:t>
      </w:r>
    </w:p>
    {/experience}
    {/hasExperience}

    <!-- Education Section -->
    {#hasEducation}
    <w:p>
      <w:pPr><w:spacing w:before="200"/><w:pBdr><w:left w:val="single" w:sz="24" w:color="0D9488"/></w:pBdr><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="0D9488"/></w:rPr>
        <w:t>EDUCATION</w:t>
      </w:r>
    </w:p>
    {#education}
    <w:p>
      <w:pPr><w:spacing w:before="100"/><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="22"/></w:rPr>
        <w:t>{degree}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:spacing w:after="100"/><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="20"/></w:rPr>
        <w:t>{school}</w:t>
      </w:r>
      <w:r>
        <w:rPr><w:sz w:val="20"/><w:color w:val="666666"/></w:rPr>
        <w:t>  •  {year}</w:t>
      </w:r>
    </w:p>
    {/education}
    {/hasEducation}

    <!-- Skills Section -->
    {#hasSkills}
    <w:p>
      <w:pPr><w:spacing w:before="200"/><w:pBdr><w:left w:val="single" w:sz="24" w:color="0D9488"/></w:pBdr><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="0D9488"/></w:rPr>
        <w:t>SKILLS</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:ind w:left="200"/></w:pPr>
      <w:r>
        <w:rPr><w:sz w:val="20"/></w:rPr>
        <w:t>{skills}</w:t>
      </w:r>
    </w:p>
    {/hasSkills}

  </w:body>
</w:document>`;

// Create templates directory
const templatesDir = path.join(__dirname, '..', 'public', 'templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Generate and save templates
const templates = [
  { name: 'professional', content: professionalTemplate },
  { name: 'modern', content: modernTemplate },
  { name: 'creative', content: creativeTemplate },
];

templates.forEach(template => {
  const docx = createDocxTemplate(template.content);
  const outputPath = path.join(templatesDir, `resume-${template.name}.docx`);
  fs.writeFileSync(outputPath, docx);
  console.log(`Created: ${outputPath}`);
});

console.log('All templates created successfully!');
