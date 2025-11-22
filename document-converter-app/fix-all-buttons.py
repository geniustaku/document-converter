#!/usr/bin/env python3
"""Fix all small buttons to have black text across all AI tools"""

import re

files = [
    'src/pages/ai-email-writer.tsx',
    'src/pages/ai-product-description.tsx',
    'src/pages/ai-social-media.tsx'
]

for filename in files:
    print(f'Processing {filename}...')
    try:
        with open(filename, 'r') as f:
            content = f.read()

        # Fix tone/style buttons - make text larger, bolder, and black
        # Pattern: px-4 py-2 rounded-lg border-2 capitalize text-sm font-semibold
        content = re.sub(
            r'className=\{`px-4 py-2 rounded-lg border-2 capitalize text-sm font-semibold',
            r'className={`px-4 py-2 rounded-lg border-2 capitalize text-base font-bold',
            content
        )

        # Add style={{ color: '#000000' }} after these buttons
        # Find buttons without style and add it
        content = re.sub(
            r'(className=\{`px-4 py-2 rounded-lg border-2 capitalize text-base font-bold[^}]+\}\})\s*\n\s*>',
            r'\1\n                      style={{ color: \'#000000\' }}\n                    >',
            content
        )

        with open(filename, 'w') as f:
            f.write(content)

        print(f'✓ Fixed {filename}')
    except Exception as e:
        print(f'✗ Error: {e}')

print('\n✓ All buttons fixed!')
