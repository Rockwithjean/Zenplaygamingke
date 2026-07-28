
$files = Get-ChildItem -Path "." -Filter "*.html"
foreach ($file in $files) {
    if ($file.Name -eq "index.html") { continue }
    $content = Get-Content $file.FullName -Raw

    $pattern1 = "(?s)(<ul class=`"tk-nav-links`">\s*)(<li><a href=`"index\.html`"[^>]*>Home</a></li>)(.*?)(<li><a href=`"register\.html`" class=`"tk-nav-cta`">Register Now</a></li>\s*)"
    $content = [regex]::Replace($content, $pattern1, "`$1`$4`$2`$3")

    $pattern2 = "(?s)(<div class=`"tk-mobile-nav`">\s*<button class=`"tk-mobile-nav-close`" aria-label=`"Close`">?</button>\s*)(<a href=`"index\.html`"[^>]*>Home</a>)(.*?)(<a href=`"register\.html`" style=`"color:var\(--gold\);`">Register Now</a>\s*)"
    $content = [regex]::Replace($content, $pattern2, "`$1`$4`$2`$3")

    Set-Content -Path $file.FullName -Value $content
}

