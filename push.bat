@echo off
echo ==========================================
echo  ArenaFlow 360 - GitHub Push Utility
echo ==========================================
echo.

:: Stage all changes
echo [+] Staging all changes...
git add .
if %errorlevel% neq 0 (
    echo [x] Error: Failed to stage changes. Is Git initialized?
    goto :end
)

:: Prompt for commit message
echo.
set /p MSG="Enter commit message (Press Enter for default 'Update codebase'): "
if "%MSG%"=="" set MSG=Update codebase

:: Commit changes
echo.
echo [+] Committing changes: "%MSG%"...
git commit -m "%MSG%"
if %errorlevel% neq 0 (
    echo [x] Error: Failed to commit changes. (Are there any new changes to commit?)
    goto :end
)

:: Push to GitHub
echo.
echo [+] Pushing to remote branch 'main'...
git push origin main
if %errorlevel% neq 0 (
    echo [x] Error: Failed to push to remote. Check your network or permissions.
    goto :end
)

echo.
echo ==========================================
echo [+] Success! Code pushed to GitHub.
echo ==========================================

:end
echo.
pause
