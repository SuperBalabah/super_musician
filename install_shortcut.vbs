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

MsgBox "Super Musician 桌面捷徑已成功建立！" & vbCrLf & vbCrLf & "捷徑位置：" & shortcutPath & vbCrLf & "您現在可以直接雙擊桌面圖示啟動。", vbInformation, "Super Musician 安裝成功"

