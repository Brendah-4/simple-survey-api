# Railway deployment script for simple-survey-api
# Prerequisites: Run "railway login" first (or railway login --browserless)

$railway = "H:\npm-global\node_modules\@railway\cli\bin\railway.exe"

Write-Host "=== Step 1: Create Railway project ===" -ForegroundColor Cyan
& $railway init

Write-Host ""
Write-Host "=== Step 2: Add MySQL database service ===" -ForegroundColor Cyan
& $railway add --database mysql --json

Write-Host ""
Write-Host "=== Step 3: Set API environment variables ===" -ForegroundColor Cyan
& $railway variable set "DB_HOST=`${{MySQL.MYSQLHOST}}" --service simple-survey-api
& $railway variable set "DB_PORT=`${{MySQL.MYSQLPORT}}" --service simple-survey-api
& $railway variable set "DB_USER=`${{MySQL.MYSQLUSER}}" --service simple-survey-api
& $railway variable set "DB_PASSWORD=`${{MySQL.MYSQLPASSWORD}}" --service simple-survey-api
& $railway variable set "DB_NAME=simple_survey" --service simple-survey-api

Write-Host ""
Write-Host "=== Step 4: Deploy API code ===" -ForegroundColor Cyan
& $railway up --detach

Write-Host ""
Write-Host "=== Step 5: Get public URL ===" -ForegroundColor Cyan
& $railway domain

Write-Host ""
Write-Host "Copy the URL shown above. Then update:" -ForegroundColor Green
Write-Host "  h:\BRENDAH RONO\simple-survey-mobile\src\lib\api.js" -ForegroundColor Yellow
Write-Host "  Change API_BASE from 192.168.110.113:3000 to the Railway URL" -ForegroundColor Yellow
Write-Host "  Then run: eas build --platform android --profile preview" -ForegroundColor Yellow
