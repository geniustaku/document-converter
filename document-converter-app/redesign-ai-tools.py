#!/usr/bin/env python3
"""
Redesign UI/UX for all AI-Powered Tools
Makes cards, buttons, and fonts more readable and visible
"""

import re

files = [
    'src/pages/ai-summarizer.tsx',
    'src/pages/ai-content-writer.tsx',
    'src/pages/ai-email-writer.tsx',
    'src/pages/ai-social-media.tsx',
    'src/pages/ai-grammar-checker.tsx',
    'src/pages/ai-product-description.tsx'
]

def redesign_ui(content):
    """Apply comprehensive UI/UX improvements"""

    # 1. Improve main container - add visible border
    content = re.sub(
        r'<div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">',
        r'<div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8" style={{ border: \'2px solid #e5e7eb\' }}>',
        content
    )

    # 2. Make all labels larger and bolder
    content = re.sub(
        r'<label className="block text-sm font-semibold mb-3" style=\{\{ color: \'#000000\' \}\}>',
        r'<label className="block text-base font-bold mb-4" style={{ color: \'#1a202c\', fontSize: \'17px\' }}>',
        content
    )

    # 3. Improve option cards - make borders thicker and more visible
    # For grid gap-2 to gap-3
    content = re.sub(r'grid-cols-3 gap-2', 'grid-cols-3 gap-3', content)
    content = re.sub(r'grid-cols-2 md:grid-cols-5 gap-3', 'grid-cols-2 md:grid-cols-5 gap-4', content)
    content = re.sub(r'grid-cols-2 md:grid-cols-4 gap-3', 'grid-cols-2 md:grid-cols-4 gap-4', content)
    content = re.sub(r'grid-cols-2 md:grid-cols-3 gap-3', 'grid-cols-2 md:grid-cols-3 gap-4', content)

    # 4. Make button borders thicker and text larger
    content = re.sub(
        r'className=\{`p-3 rounded-lg border-2',
        r'className={`p-4 rounded-xl border-3',
        content
    )

    # 5. Add borderWidth style for thicker borders
    content = re.sub(
        r'(className=\{`[^`]*?border-3[^`]*?`\})',
        r'\1\n                      style={{ borderWidth: \'3px\' }}',
        content
    )

    # 6. Make text in buttons larger and bolder
    content = re.sub(
        r'<div className="font-semibold text-sm">',
        r'<div className="font-bold text-base" style={{ color: \'#000000\' }}>',
        content
    )

    # 7. Make description text more visible
    content = re.sub(
        r'<div className="text-xs" style=\{\{ color: \'#000000\' \}\}>',
        r'<div className="text-sm" style={{ color: \'#4a5568\', fontWeight: \'500\' }}>',
        content
    )

    # 8. Improve icon sizes
    content = re.sub(r'text-xl mb-1', 'text-2xl mb-2', content)
    content = re.sub(r'text-2xl mb-1', 'text-3xl mb-2', content)

    # 9. Improve hover states - make them more visible
    content = re.sub(
        r'border-gray-200 hover:border-(\w+)-300',
        r'border-gray-300 hover:border-\1-400 hover:shadow-sm',
        content
    )

    # 10. Make selected states more prominent
    content = re.sub(
        r'border-(\w+)-500 bg-\1-50',
        r'border-\1-500 bg-\1-50 shadow-md',
        content
    )

    # 11. Add transition effects
    content = re.sub(
        r'(className=\{`[^`]*?border-3[^`]*?text-\w+)',
        r'\1 transition-all',
        content
    )

    # 12. Make feature cards more prominent
    content = re.sub(
        r'<div className="bg-white p-6 rounded-xl shadow-md text-center">',
        r'<div className="bg-white p-6 rounded-xl shadow-lg text-center border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all">',
        content
    )

    # 13. Make feature card titles larger
    content = re.sub(
        r'<h3 className="font-bold text-lg mb-2">',
        r'<h3 className="font-bold text-xl mb-3" style={{ color: \'#1a202c\' }}>',
        content
    )

    # 14. Make feature card descriptions more readable
    content = re.sub(
        r'<p className="text-sm" style=\{\{ color: \'#000000\' \}\}>',
        r'<p className="text-base" style={{ color: \'#4a5568\', fontWeight: \'500\', lineHeight: \'1.6\' }}>',
        content
    )

    # 15. Improve input fields - make text larger
    content = re.sub(
        r'className="w-full px-4 py-3 border-2',
        r'className="w-full px-5 py-4 border-3',
        content
    )

    # 16. Improve generate buttons - make them larger and more prominent
    content = re.sub(
        r'className="w-full bg-gradient-to-r from-(\w+)-500 to-\1-600 text-white px-8 py-4',
        r'className="w-full bg-gradient-to-r from-\1-500 to-\1-600 text-white px-8 py-5 text-lg font-bold',
        content
    )

    return content

# Process all files
for filename in files:
    print(f'Processing {filename}...')
    try:
        with open(filename, 'r') as f:
            content = f.read()

        # Apply redesign
        new_content = redesign_ui(content)

        with open(filename, 'w') as f:
            f.write(new_content)

        print(f'✓ Successfully redesigned {filename}')
    except Exception as e:
        print(f'✗ Error processing {filename}: {e}')

print('\n✓ All AI tools redesigned successfully!')
