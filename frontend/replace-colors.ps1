$srcPath = "src\pages"
Get-ChildItem -Recurse -Filter "*.tsx" -Path $srcPath | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $updated = $content
    $updated = $updated -replace '\[#0EA5A4\]', '[#862fe7]'
    $updated = $updated -replace '\[#14B8A6\]', '[#ad6df4]'
    $updated = $updated -replace 'shadow-\[#0EA5A4', 'shadow-[rgba(134,47,231,0.25)'
    $updated = $updated -replace 'ring-\[rgba\(14,165,164', 'ring-[rgba(134,47,231'
    $updated = $updated -replace 'shadow-teal', 'shadow-violet'
    if ($updated -ne $content) {
        Set-Content $_.FullName $updated -NoNewline
        Write-Host "Updated: $($_.Name)"
    }
}
Write-Host "Done."
