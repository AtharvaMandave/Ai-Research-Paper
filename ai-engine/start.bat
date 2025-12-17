@echo off
echo Starting ARPS AI Engine...
echo.

REM Activate virtual environment and run the server
call venv\Scripts\activate.bat
python main.py

pause
