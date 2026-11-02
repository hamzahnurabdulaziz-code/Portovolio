Set WshShell = CreateObject("WScript.Shell")
strCurrentDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

' Jalankan node server.js di latar belakang (tanpa jendela cmd / mode senyap)
WshShell.CurrentDirectory = strCurrentDir
WshShell.Run "cmd /c node server.js", 0, False

' Tunggu 1.5 detik agar server siap lalu buka web browser
WScript.Sleep 1500
WshShell.Run "http://localhost:3000"
