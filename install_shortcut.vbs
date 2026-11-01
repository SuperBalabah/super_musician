Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
desktopPath = WshShell.SpecialFolders("Desktop")
shortcutPath = desktopPath & "\Super Musician.lnk"

Set shortcut = WshShell.CreateShortcut(shortcutPath)
shortcut.TargetPath = currentDir & "\start_super_musician.vbs"
shortcut.WorkingDirectory = currentDir
shortcut.Description = "Super Musician - AI Guitar Chord & Tab Studio"
shortcut.IconLocation = currentDir & "\super_musician.ico,0"
shortcut.Save

MsgBox "Super Musician desktop shortcut created successfully!" & vbCrLf & vbCrLf & "Location: " & shortcutPath, 64, "Super Musician"
