function Get-RelativePath {
    param($from, $to)
    $fromDir = [System.IO.Path]::GetDirectoryName([System.IO.Path]::GetFullPath($from))
    $toAbs = [System.IO.Path]::GetFullPath($to)
    
    # Use Uri for relative path calculation
    $uriFrom = New-Object System.Uri -ArgumentList ($fromDir + "\")
    $uriTo = New-Object System.Uri -ArgumentList $toAbs
    $rel = $uriFrom.MakeRelativeUri($uriTo).ToString().Replace("\", "/")
    
    # Remove .ts extension and ensure relative prefix
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
    $lines = Get-Content $file
    $changed = $false
    $newLines = @()
    foreach ($line in $lines) {
        $newLine = $line
        # Handle named imports: import { S1, S2 } from '';
        if ($line -match "import\s+\{([^}]+)\}\s+from\s+'';") {
            $symbolsRaw = $Matches[1] -split ','
            $foundPath = $null
            foreach ($s in $symbolsRaw) {
                $sym = $s.Trim().Split(' ')[-1] # handle "type Symbol"
                if ($symbolMap.ContainsKey($sym)) {
                    $foundPath = Get-RelativePath -from $file -to $symbolMap[$sym]
                    break
                }
            }
            if ($foundPath) {
                $newLine = $line -replace "from '';", "from '$foundPath';"
                $changed = $true
            }
        }
        # Handle default-like imports: import symbol from '';
        elseif ($line -match "import\s+(\w+)\s+from\s+'';") {
            $sym = $Matches[1]
            if ($symbolMap.ContainsKey($sym)) {
                $target = $symbolMap[$sym]
                $foundPath = Get-RelativePath -from $file -to $target
                $newLine = $line -replace "from '';", "from '$foundPath';"
                $changed = $true
            }
        }
        $newLines += $newLine
    }
    if ($changed) {
        $newLines | Set-Content $file -Encoding utf8
        Write-Host "Repaired $file"
    }
}
