@echo off
title ChessResults.in Local Preview Server
echo ============================================================
echo        ChessResults.in — Local Web Spectator Server         
echo ============================================================
echo.
echo Opening http://localhost:3000 in your browser...
start http://localhost:3000
echo.
echo Serving files from this folder. Press Ctrl+C to stop.
echo.
npx serve -l 3000 .
pause
