# Fija la ventana del teleprompter "siempre al frente" (topmost) sin moverla,
# sin cambiar su tamano y sin robar el foco.
# Uso: fijar_al_frente.ps1 [-Titulo "Teleprompter por voz"] [-EsperarSeg 10]
#   -EsperarSeg: reintenta cada segundo mientras la pagina carga su titulo.
param(
    [string]$Titulo = "Teleprompter por voz",
    [int]$EsperarSeg = 0
)
. "$PSScriptRoot\_ventanas.ps1"

$ventanas = Get-VentanasTeleprompter $Titulo
$intentos = 0
while ($ventanas.Count -eq 0 -and $intentos -lt $EsperarSeg) {
    Start-Sleep -Seconds 1
    $intentos++
    $ventanas = Get-VentanasTeleprompter $Titulo
}
if ($ventanas.Count -eq 0) {
    Write-Host "No se encontro ninguna ventana del teleprompter ('$Titulo')."
    exit 1
}
foreach ($v in $ventanas) {
    $ok = [TpWin]::SetWindowPos($v.Handle, [TpWin]::HWND_TOPMOST, 0, 0, 0, 0,
        [TpWin]::SWP_NOMOVE -bor [TpWin]::SWP_NOSIZE -bor [TpWin]::SWP_NOACTIVATE)
    if ($ok) { Write-Host ">> Siempre al frente: [$($v.Title)]" }
    else     { Write-Host "Aviso: no se pudo fijar [$($v.Title)]." }
}
