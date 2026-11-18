@echo off
title Student Record Management System - Setup & Launcher
color 0A

echo ========================================================
echo   Student Record Management System - Setup ^& Launcher
echo ========================================================
echo.

:: Step 1: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js was not found on your system.
    echo [*] Attempting to install Node.js LTS automatically via winget...
    echo.
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    if %errorlevel% neq 0 (
        echo.
        echo [X] Automatic installation failed or winget is unavailable.
        echo     Please download and install Node.js LTS manually from:
        echo     https://nodejs.org/
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [+] Node.js installed successfully!
    echo [!] IMPORTANT: Please CLOSE this window and double-click this .bat file again
    echo     so Windows loads the new Node.js environment path.
    pause
    exit /b 0
)

echo [OK] Node.js found:
node -v
echo [OK] npm found:
call npm -v
echo.

:: Step 2: Check for .env file
if not exist ".env" (
    if exist ".env.example" (
        echo [*] Creating .env file from .env.example...
        copy ".env.example" ".env" >nul
    ) else (
        echo [*] Creating default .env file...
        (
            echo GEMINI_API_KEY=your_gemini_api_key_here
            echo VITE_GEMINI_API_KEY=your_gemini_api_key_here
        ) > ".env"
    )
    echo [!] A new .env file was created. Remember to paste your Gemini API key inside it!
    echo.
)

:: Step 3: Install dependencies if node_modules does not exist
if not exist "node_modules" (
    echo [*] Installing project dependencies ^(this may take 1-2 minutes^)...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [X] npm install failed. Check your internet connection and try again.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed!
    echo.
) else (
    echo [OK] node_modules folder already exists. Skipping installation.
    echo.
)

:: Step 4: Start the development server
echo [*] Starting the development server...
echo [*] Press Ctrl + C at any time to stop the server.
echo.
call npm run dev
pause