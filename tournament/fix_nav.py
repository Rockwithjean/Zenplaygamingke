import os
import re
import glob

directory = r"c:\Users\zenpl\Downloads\Zenplaygamingke-main\Zenplaygamingke-main\tournament"

for filepath in glob.glob(os.path.join(directory, "*.html")):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Desktop nav
    pattern = r'(<ul class="tk-nav-links">\s*)(<li><a href="index\.html"[^>]*>Home</a></li>)([\s\S]*?)(<li><a href="register\.html" class="tk-nav-cta">Register Now</a></li>\s*)'
    replacement = r'\1\4\2\3'
    new_content = re.sub(pattern, replacement, content)

    # Mobile nav
    pattern2 = r'(<div class="tk-mobile-nav">\s*<button class="tk-mobile-nav-close" aria-label="Close">✕</button>\s*)(<a href="index\.html"[^>]*>Home</a>)([\s\S]*?)(<a href="register\.html" style="color:var\(--gold\);">Register Now</a>\s*)'
    replacement2 = r'\1\4\2\3'
    new_content = re.sub(pattern2, replacement2, new_content)

    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {os.path.basename(filepath)}")

print("Done")
