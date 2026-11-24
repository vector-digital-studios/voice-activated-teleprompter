# Utilidades compartidas: enumerar las ventanas del teleprompter.
# Solo cuentan ventanas VISIBLES de chrome.exe / msedge.exe cuyo titulo
# contenga $Titulo (por defecto el <title> de la app: "Teleprompter por voz").
# Asi nunca se tocan otras ventanas (un editor o una carpeta llamados
# "teleprompter", por ejemplo).
Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;
public class TpWin {
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc f, IntPtr l);
    [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
    [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int cx, int cy, uint flags);
    [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr h, uint msg, IntPtr w, IntPtr l);
    public static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
    public const uint SWP_NOSIZE = 0x0001, SWP_NOMOVE = 0x0002, SWP_NOACTIVATE = 0x0010;
    public const uint WM_CLOSE = 0x0010;
}
"@

function Get-VentanasTeleprompter([string]$Titulo) {
    $lista = [System.Collections.Generic.List[object]]::new()
    $cb = [TpWin+EnumWindowsProc]{ param($h, $l)
        if ([TpWin]::IsWindowVisible($h)) {
            $sb = New-Object System.Text.StringBuilder 512
            [void][TpWin]::GetWindowText($h, $sb, 512)
            $t = $sb.ToString()
            if ($t -and $t.Contains($Titulo)) {
                $procId = [uint32]0
                [void][TpWin]::GetWindowThreadProcessId($h, [ref]$procId)
                $p = Get-Process -Id $procId -ErrorAction SilentlyContinue
                if ($p -and @('chrome', 'msedge') -contains $p.ProcessName.ToLower()) {
                    $lista.Add([pscustomobject]@{ Handle = $h; Title = $t })
                }
            }
        }
        return $true
    }
    [void][TpWin]::EnumWindows($cb, [IntPtr]::Zero)
    return , $lista
}
