@echo off
title Rift Intelligence
setlocal
cd /d "%~dp0"

REM ── Enable ANSI colour (Windows 10/11) and grab the ESC character ──
for /F %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "GOLD=%ESC%[38;2;199;168;106m"
set "BONE=%ESC%[38;2;233;230;221m"
set "DIM=%ESC%[38;2;138;147;160m"
set "GREEN=%ESC%[38;2;79;168;144m"
set "RED=%ESC%[38;2;199;93;84m"
set "R=%ESC%[0m"

cls
echo.
echo  %GOLD%===========================================================%R%
echo.
echo     %BONE%R I F T   I N T E L L I G E N C E%R%
echo     %DIM%Summoner Reconnaissance Division%R%
echo.
echo  %GOLD%===========================================================%R%
echo.

REM ── Node.js present? ──
where node >nul 2>nul
if errorlevel 1 (
  echo  %RED%Node.js was not found on your PATH.%R%
  echo  Install it from https://nodejs.org and run this again.
  echo.
  pause
  exit /b 1
)

REM ── Dependencies (first run only) ──
if not exist "node_modules" (
  echo  %DIM%Installing dependencies, this only happens once...%R%
  call npm install
  if errorlevel 1 (
    echo  %RED%npm install failed - see the messages above.%R%
    pause
    exit /b 1
  )
  echo.
)

REM ── React client: install deps (first run) then build the interface ──
if not exist "client\node_modules" (
  echo  %DIM%Installing interface dependencies, this only happens once...%R%
  call npm --prefix client install
  if errorlevel 1 (
    echo  %RED%client npm install failed - see the messages above.%R%
    pause
    exit /b 1
  )
  echo.
)
echo  %DIM%Building the interface...%R%
call npm --prefix client run build
if errorlevel 1 (
  echo  %RED%Interface build failed - see the messages above.%R%
  pause
  exit /b 1
)
echo  %GREEN%Interface ready.%R%
echo.

REM ── Is a real key already saved? ──
set "HASKEY="
if exist ".env" (
  findstr /C:"RIOT_API_KEY=RGAPI-" ".env" >nul 2>nul && set "HASKEY=1"
  findstr /C:"RGAPI-your-key-here" ".env" >nul 2>nul && set "HASKEY="
)

echo  %DIM%Free key at https://developer.riotgames.com  (expires every 24h)%R%
echo.
set "RIOTKEY="
if defined HASKEY (
  set /p "RIOTKEY=  %GOLD%Key on file.%R% Paste a NEW key to update, or press Enter to keep it: "
) else (
  set /p "RIOTKEY=  %GOLD%Riot API key%R% (or press Enter to skip for now): "
)

if defined RIOTKEY (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$p=3000; if(Test-Path '.env'){$mp=Select-String -Path '.env' -Pattern '^PORT=(.+)$' -ErrorAction SilentlyContinue; if($mp){$p=$mp.Matches[0].Groups[1].Value}}; Set-Content -Path '.env' -Value @(('RIOT_API_KEY='+$env:RIOTKEY.Trim()),('PORT='+$p)) -Encoding ascii"
  echo   %GREEN%Key saved to .env%R%
) else (
  if not defined HASKEY echo   %RED%No key set - searches will fail until one is added.%R%
)

echo.
echo  %GOLD%-----------------------------------------------------------%R%
echo   %BONE%Server starting in this window.%R%  %DIM%Press Ctrl+C to stop.%R%
echo   %DIM%Browser will open at%R% %GOLD%http://localhost:3000%R%
echo  %GOLD%-----------------------------------------------------------%R%
echo.

REM ── Open the browser ~3s later, in the background, with NO extra window ──
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"

REM ── Run the server in THIS console (no second window) ──
node server.js

echo.
echo  %DIM%Server stopped.%R%
pause
