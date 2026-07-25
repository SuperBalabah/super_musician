import os
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw

base_dir = Path(r"c:\Users\USER\balabah's_gemini_workspace\music_analyzer").resolve()
png_path = Path(r"C:\Users\USER\.gemini\antigravity-ide\brain\ed7457d0-1ef9-4ea5-85d8-b690ba14fd73\super_musician_icon_clean_1784990012546.png")
ico_path = base_dir / "super_musician.ico"

# 1. Ensure custom ICO icon is clean and transparent
if png_path.exists():
    img = Image.open(png_path).convert("RGBA")
    w, h = img.size
    crop_margin = int(w * 0.06)
    img_cropped = img.crop((crop_margin, crop_margin, w - crop_margin, h - crop_margin))

    size = img_cropped.size
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    radius = int(size[0] * 0.22)
    draw.rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)

    output = Image.new("RGBA", size, (0, 0, 0, 0))
    output.paste(img_cropped, (0, 0), mask=mask)
    output.save(ico_path, format="ICO", sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])

# 2. Create 100% Silent VBScript Launcher (Zero Terminal Windows)
vbs_path = base_dir / "start_super_musician.vbs"
vbs_content = r'''Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c ""C:\Users\USER\balabah's_gemini_workspace\music_analyzer\start_super_musician.bat""", 7, False
'''

vbs_path.write_text(vbs_content, encoding="utf-8")
print("Silent VBScript launcher created:", vbs_path)


# 3. Create Windows Shortcut pointing to cmd.exe + start_super_musician.bat
bat_path = base_dir / "start_super_musician.bat"
ico_str = str(ico_path).replace("'", "''")
bat_str = str(bat_path).replace("'", "''")
base_str = str(base_dir).replace("'", "''")

ps_cmd = f"""
$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop 'super_musician.lnk'
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($shortcutPath)
$Shortcut.TargetPath = 'cmd.exe'
$Shortcut.Arguments = '/c "{bat_str}"'
$Shortcut.WorkingDirectory = '{base_str}'
$Shortcut.WindowStyle = 7
$Shortcut.Description = 'super_musician Pro Studio'
$Shortcut.IconLocation = '{ico_str}'
$Shortcut.Save()
Write-Host "Updated Shortcut for Taskbar Grouping (Minimized BAT) At: $shortcutPath"
"""

res = subprocess.run(["powershell", "-Command", ps_cmd], capture_output=True, text=True)
print("PowerShell Output:", res.stdout.strip())

