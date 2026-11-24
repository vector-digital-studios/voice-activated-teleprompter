# Cierra SOLO las ventanas del teleprompter abiertas antes (WM_CLOSE a cada
# ventana), sin cerrar el resto del navegador.
param([string]$Titulo = "Teleprompter por voz")
. "$PSScriptRoot\_ventanas.ps1"

$ventanas = Get-VentanasTeleprompter $Titulo
foreach ($v in $ventanas) {
    [void][TpWin]::SendMessage($v.Handle, [TpWin]::WM_CLOSE, [IntPtr]::Zero, [IntPtr]::Zero)
}
Write-Host ("Ventanas del teleprompter cerradas: " + $ventanas.Count)
if ($ventanas.Count -gt 0) { Start-Sleep -Milliseconds 1200 }
