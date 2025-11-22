#!/usr/bin/env python3
"""Fix escaped quotes in JSX files"""

import re

files = [
    'src/pages/ai-summarizer.tsx',
    'src/pages/ai-content-writer.tsx',
    'src/pages/ai-email-writer.tsx',
    'src/pages/ai-social-media.tsx',
    'src/pages/ai-grammar-checker.tsx',
    'src/pages/ai-product-description.tsx'
]

for filename in files:
    print(f'Fixing {filename}...')
    try:
        with open(filename, 'r') as f:
            content = f.read()

        # Fix escaped quotes in style attributes
        content = content.replace("\\'", "'")

        with open(filename, 'w') as f:
            f.write(content)

        print(f'✓ Fixed {filename}')
    except Exception as e:
        print(f'✗ Error: {e}')

print('\n✓ All files fixed!')
