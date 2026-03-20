function Get-RelativePath {
    param($from, $to)
    $fromDir = [System.IO.Path]::GetDirectoryName([System.IO.Path]::GetFullPath($from))
    $toAbs = [System.IO.Path]::GetFullPath($to)
    
    # Simple relative path calculation for the same drive
    $uriFrom = New-Object System.Uri -ArgumentList ($fromDir + "\")
    $uriTo = New-Object System.Uri -ArgumentList $toAbs
    $rel = $uriFrom.MakeRelativeUri($uriTo).ToString().Replace("\", "/")
    
    # Remove .ts extension
    if ($rel.EndsWith(".ts")) { $rel = $rel.Substring(0, $rel.Length - 3) }
    if (-not $rel.StartsWith(".")) { $rel = "./" + $rel }
    return $rel
}

# 1. Load export map
$symbolMap = @{}
Import-Csv -Path tmp_export_map.csv -Header "Symbol","Path" | ForEach-Object {
    if (-not $symbolMap.ContainsKey($_.Symbol)) {
        $symbolMap[$_.Symbol] = $_.Path
    }
}

# 2. Iterate over src files
Get-ChildItem -Path src -Filter *.ts -Recurse | ForEach-Object {
    $file = $_.FullName
    $content = Get-Content $file -Raw
    $changed = $false
    
    # Regex for named imports: import { S1, S2 } from '';
    $newContent = [regex]::Replace($content, "import\s+\{([^}]+)\}\s+from\s+'';", {
        param($m)
        $symbolsRaw = $m.Groups[1].Value -split ','
        $foundPath = $null
        foreach ($s in $symbolsRaw) {
            $sym = $s.Trim().Split(' ')[-1] # handle "type Symbol"
            if ($symbolMap.ContainsKey($sym)) {
                $target = $symbolMap[$sym]
                $foundPath = Get-RelativePath -from $file -to $target
                break
            }
        }
        if ($foundPath) { 
            return $m.Value.Replace("from '';", "from '$foundPath';") 
        }
        return $m.Value
    })

    if ($content -ne $newContent) {
        Set-Content $file $newContent
        Write-Host "Repaired $file"
        $changed = $true
    }
}
