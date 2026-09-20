@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
    set "PYTHON_CMD=py -3"
) else (
    set "PYTHON_CMD=python"
)
if not exist ".venv\Scripts\python.exe" (
    %PYTHON_CMD% -m venv .venv
    if errorlevel 1 goto setup_error
)
.venv\Scripts\python.exe -c "import pygame" >nul 2>nul
if errorlevel 1 (
    .venv\Scripts\python.exe -m pip install -r requirements.txt
    if errorlevel 1 goto setup_error
)
.venv\Scripts\python.exe game.py
if errorlevel 1 pause
exit /b
:setup_error
echo.
echo Setup failed. Install Python 3.10 or newer from python.org.
echo Enable the Python launcher and Add Python to PATH during installation.
echo Internet access is needed for the first Pygame installation.
pause
