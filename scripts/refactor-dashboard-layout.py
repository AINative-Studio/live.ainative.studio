#!/usr/bin/env python3
import re, os
def refactor_dashboard_page(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    content = re.sub(r"import \{ Navbar \} from '@/components/navbar';\n", '', content)
    content = re.sub(r"import \{ Footer \} from '@/components/footer';\n", '', content)
    content = re.sub(r'return \(\s*<div className="flex flex-col min-h-screen">\s*<Navbar />\s*<main className="flex-1 bg-gradient-to-b from-background to-card/30">\s*', 'return (\n    ', content, flags=re.MULTILINE | re.DOTALL)
    content = re.sub(r'\s*</main>\s*<Footer />\s*</div>\s*\);', '\n  );', content, flags=re.MULTILINE | re.DOTALL)
    return content
files = ['app/dashboard/page.tsx', 'app/dashboard/analytics/page.tsx', 'app/dashboard/notifications/page.tsx', 'app/dashboard/schedule/page.tsx', 'app/dashboard/go-live/page.tsx']
for filepath in files:
    full_path = os.path.join('/Users/aideveloper/live.ainative.studio', filepath)
    if os.path.exists(full_path):
        print(f"Refactoring {filepath}...")
        refactored_content = refactor_dashboard_page(full_path)
        with open(full_path, 'w') as f:
            f.write(refactored_content)
        print(f"✓ {filepath} refactored")
print("\nAll files refactored successfully!")
