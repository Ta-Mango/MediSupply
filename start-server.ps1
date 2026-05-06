$nodePath = "C:\Program Files\nodejs\node.exe"
$scriptPath = "C:\medisupply\server.cjs"
$workingDir = "C:\medisupply"

$process = Start-Process -NoNewWindow -FilePath $nodePath -ArgumentList $scriptPath -WorkingDirectory $workingDir -PassThru
Write-Host "Started server with PID: $($process.Id)"
Start-Sleep -Seconds 2
netstat -ano | Select-String ":3000"
Write-Host "Server should be running. Press Ctrl+C to stop."

# Keep alive
try {
    $process | Wait-Process
} catch {
    Write-Host "Process ended"
}