#!/usr/bin/env python3
"""Fix malformed style attributes in grammar checker"""

import re

with open('src/pages/ai-grammar-checker.tsx', 'r') as f:
    content = f.read()

# Fix: className="text-lg font-bold style={{ color: '#000000' }} mb-3
content = re.sub(
    r'className="text-lg font-bold style\{\{ color: \'#000000\' \}\} (mb-[23])',
    r'className="text-lg font-bold \1" style={{ color: \'#1a202c\' }}',
    content
)

# Fix: className="text-sm style={{ color: '#000000' }} leading-relaxed"
content = re.sub(
    r'className="text-sm style\{\{ color: \'#000000\' \}\} leading-relaxed"',
    r'className="text-sm leading-relaxed"',
    content
)

# Fix: <p className="style={{ color: '#000000' }} text-sm">
content = re.sub(
    r'<p className="style\{\{ color: \'#000000\' \}\} text-sm">',
    r'<p className="text-base" style={{ color: \'#4a5568\', fontWeight: \'500\', lineHeight: \'1.6\' }}>',
    content
)

with open('src/pages/ai-grammar-checker.tsx', 'w') as f:
    f.write(content)

print('✓ Fixed grammar checker!')
