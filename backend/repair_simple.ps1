function Get-RelativePath {
    param($from, $to)
    $fromDir = [System.IO.Path]::GetDirectoryName([System.IO.Path]::GetFullPath($from))
    $toAbs = [System.IO.Path]::GetFullPath($to)
    $uriFrom = New-Object System.Uri -ArgumentList ($fromDir + "\")
    $uriTo = New-Object System.Uri -ArgumentList $toAbs
    $rel = $uriFrom.MakeRelativeUri($uriTo).ToString().Replace("\", "/")
    if ($rel.EndsWith(".ts")) { $rel = $rel.Substring(0, $rel.Length - 3) }
    if (-not $rel.StartsWith(".")) { $rel = "./" + $rel }
    return $rel
}

$symbolMap = @{}
Import-Csv -Path tmp_export_map.csv -Header "Symbol","Path" | ForEach-Object {
    if (-not $symbolMap.ContainsKey($_.Symbol)) {
        $symbolMap[$_.Symbol] = $_.Path
    }
}

Get-ChildItem -Path src -Filter *.ts -Recurse | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw
    $newContent = [regex]::Replace($content, "import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+'';", {
        param($m)
        $syms = $null
        if ($m.Groups[1].Success) { $syms = $m.Groups[1].Value -split ',' }
        elseif ($m.Groups[2].Success) { $syms = @($m.Groups[2].Value) }
        
        if ($syms) {
            foreach ($s in $syms) {
                $sym = $s.Trim().Split(' ')[-1]
                if ($symbolMap.ContainsKey($sym)) {
                    $rel = Get-RelativePath -from $file -to $symbolMap[$sym]
                    # Replace anything from 'from' to ';' with the new path
                    return [regex]::Replace($m.Value, "from\s+'';", "from '$rel';")
                }
            }
        }
        return $m.Value
    })
    if ($content -ne $newContent) {
        Set-Content $file $newContent
        Write-Host "Fixed: $file"
    }
}
