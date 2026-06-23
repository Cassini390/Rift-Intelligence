@echo off
REM ============================================================
REM  Rift Readout - LoL Stat Tracker launcher
REM  Prompts for a Riot API key, saves it to .env, starts the
REM  server, and opens the page in your browser.
REM ============================================================

setlocal
cd /d "%~dp0"

REM --- Check Node.js is available ---
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  ERROR: Node.js was not found on your PATH.
  echo  Install it from https://nodejs.org and run this again.
  echo.
  pause
  exit /b 1
)

REM --- Install dependencies on first run ---
if not exist "node_modules" (
  echo Installing dependencies, this only happens once...
  call npm install
  if errorlevel 1 (
    echo.
    echo  ERROR: npm install failed. See the messages above.
    pause
    exit /b 1
  )
)

REM --- Decide whether a real key is already saved ---
set "HASKEY="
if exist ".env" (
  findstr /C:"RIOT_API_KEY=RGAPI-" ".env" >nul 2>nul && set "HASKEY=1"
  findstr /C:"RGAPI-your-key-here" ".env" >nul 2>nul && set "HASKEY="
)

echo.
echo  Get a free key at https://developer.riotgames.com  (expires every 24h)
echo.

set "RIOTKEY="
if defined HASKEY (
  set /p "RIOTKEY=A key is already saved. Paste a NEW key to update it, or press Enter to keep it: "
) else (
  set /p "RIOTKEY=Paste your Riot API key (or press Enter to skip for now): "
)

REM --- Save the key to .env, preserving the existing PORT ---
if defined RIOTKEY (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$p=3000; if(Test-Path '.env'){$m=Select-String -Path '.env' -Pattern '^PORT=(.+)$' -ErrorAction SilentlyContinue; if($m){$p=$m.Matches[0].Groups[1].Value}}; Set-Content -Path '.env' -Value @(('RIOT_API_KEY='+$env:RIOTKEY.Trim()),('PORT='+$p)) -Encoding ascii"
  if errorlevel 1 (
    echo  WARNING: could not write .env automatically. Edit it by hand.
  ) else (
    echo  API key saved to .env
  )
) else (
  if not defined HASKEY echo  Skipped - searches will fail until a key is added to .env
)

REM --- Start the server in its own window (keeps the log visible) ---
echo.
echo Starting server on http://localhost:3000 ...
start "Rift Readout Server" cmd /k node server.js

REM --- Give the server a moment, then open the browser ---
timeout /t 3 /nobreak >nul
start "" http://localhost:3000

endlocal
