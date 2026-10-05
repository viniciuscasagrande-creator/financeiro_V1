# Script de Backup Geral do Sistema Disk Ingressos (Financeiro + RH)
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$dateStr = Get-Date -Format "yyyyMMdd"
$sourceDir = "C:\Users\vinad\OneDrive\Desktop\Modulo_Financeiro_v1"
$zipArchive = "C:\Users\vinad\OneDrive\Desktop\Modulo_Financeiro_v1\archives\Modulo_Financeiro_V1_BACKUP_GERAL_$dateStr.zip"
$zipDesktop = "C:\Users\vinad\OneDrive\Desktop\Modulo_Financeiro_V1_BACKUP_GERAL_OFICIAL_$dateStr.zip"
$zipDownloads = "c:\Users\vinad\Downloads\Modulo_Financeiro_V1_BACKUP_GERAL_OFICIAL_$dateStr.zip"

if (-not (Test-Path "archives")) {
    New-Item -ItemType Directory -Path "archives" | Out-Null
}

Write-Host "Criando backup limpo via git archive..."
git archive --format=zip --output="$zipArchive" HEAD

if (Test-Path "$zipArchive") {
    Copy-Item "$zipArchive" "$zipDesktop" -Force
    Copy-Item "$zipArchive" "$zipDownloads" -Force
    $size = (Get-Item "$zipArchive").Length
    Write-Host "Backup Geral gerado com sucesso!" -ForegroundColor Green
    Write-Host "Tamanho: $([math]::Round($size / 1MB, 2)) MB ($size bytes)"
    Write-Host "1. Archives: $zipArchive"
    Write-Host "2. Desktop: $zipDesktop"
    Write-Host "3. Downloads: $zipDownloads"
} else {
    Write-Host "Erro ao gerar arquivo de backup." -ForegroundColor Red
}
