const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\zenpl\\Downloads\\Zenplaygamingke-main\\Zenplaygamingke-main\\tournament';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Desktop nav
    content = content.replace(
        /(<ul class="tk-nav-links">\s*)(<li><a href="index\.html"[^>]*>Home<\/a><\/li>)([\s\S]*?)(<li><a href="register\.html" class="tk-nav-cta">Register Now<\/a><\/li>\s*)/g,
        '$1$4      $2$3'
    );

    // Mobile nav
    content = content.replace(
        /(<div class="tk-mobile-nav">\s*<button class="tk-mobile-nav-close" aria-label="Close">✕<\/button>\s*)(<a href="index\.html"[^>]*>Home<\/a>)([\s\S]*?)(<a href="register\.html" style="color:var\(--gold\);">Register Now<\/a>\s*)/g,
        '$1$4    $2$3'
    );

    fs.writeFileSync(filePath, content);
}
console.log('Update successful');
