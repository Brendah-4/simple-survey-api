# Render deployment script for simple-survey-api
# Prerequisites: 
# 1. Code must be pushed to GitHub first
# 2. Render account created at render.com
# 3. Database already created on Aiven

Write-Host "=== Render Deployment Guide for simple-survey-api ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "=== Step 1: Push code to GitHub ===" -ForegroundColor Cyan
Write-Host "Run these commands in your project folder:" -ForegroundColor Yellow
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m 'deploy to render'" -ForegroundColor White
Write-Host "  git push origin main" -ForegroundColor White
Write-Host ""

Write-Host "=== Step 2: Create Web Service on Render ===" -ForegroundColor Cyan
Write-Host "1. Go to https://render.com" -ForegroundColor Yellow
Write-Host "2. Click 'New' → 'Web Service'" -ForegroundColor Yellow
Write-Host "3. Connect your GitHub repo: simple-survey-api" -ForegroundColor Yellow
Write-Host "4. Set the following:" -ForegroundColor Yellow
Write-Host "   - Name:          simple-survey-api" -ForegroundColor White
Write-Host "   - Region:        Choose closest to you" -ForegroundColor White
Write-Host "   - Branch:        main" -ForegroundColor White
Write-Host "   - Build Command: npm install" -ForegroundColor White
Write-Host "   - Start Command: node index.js" -ForegroundColor White
Write-Host "   - Plan:          Free" -ForegroundColor White
Write-Host ""

Write-Host "=== Step 3: Set Environment Variables on Render ===" -ForegroundColor Cyan
Write-Host "In Render dashboard → your service → Environment" -ForegroundColor Yellow
Write-Host "Add these variables (get values from Aiven dashboard):" -ForegroundColor Yellow
Write-Host ""
Write-Host "   DB_HOST     = your-aiven-hostname.aivencloud.com" -ForegroundColor White
Write-Host "   DB_PORT     = your-aiven-port" -ForegroundColor White
Write-Host "   DB_USER     = avnadmin" -ForegroundColor White
Write-Host "   DB_PASSWORD = your-aiven-password" -ForegroundColor White
Write-Host "   DB_NAME     = sky_survey_db" -ForegroundColor White
Write-Host "   PORT        = 3000" -ForegroundColor White
Write-Host ""

Write-Host "=== Step 4: Deploy ===" -ForegroundColor Cyan
Write-Host "1. Click 'Create Web Service'" -ForegroundColor Yellow
Write-Host "2. Render will automatically build and deploy" -ForegroundColor Yellow
Write-Host "3. Wait 2-3 minutes for deployment to complete" -ForegroundColor Yellow
Write-Host "4. You will see 'Your service is live' in the logs" -ForegroundColor Yellow
Write-Host ""

Write-Host "=== Step 5: Get Your Render URL ===" -ForegroundColor Cyan
Write-Host "Your API will be live at:" -ForegroundColor Yellow
Write-Host "  https://simple-survey-api-xxxx.onrender.com" -ForegroundColor White
Write-Host "Find it in: Render Dashboard → your service → top of page" -ForegroundColor Yellow
Write-Host ""

Write-Host "=== Step 6: Test Your API ===" -ForegroundColor Cyan
Write-Host "Open browser and visit:" -ForegroundColor Yellow
Write-Host "  https://your-render-url.onrender.com/api/surveys" -ForegroundColor White
Write-Host "You should see an XML success response" -ForegroundColor Yellow
Write-Host ""

Write-Host "=== Step 7: Update Mobile App ===" -ForegroundColor Cyan
Write-Host "Update your API base URL in:" -ForegroundColor Yellow
Write-Host "  h:\BRENDAH RONO\simple-survey-mobile\src\lib\api.js" -ForegroundColor White
Write-Host "Change API_BASE from:" -ForegroundColor Yellow
Write-Host "  192.168.110.113:3000" -ForegroundColor White
Write-Host "To your Render URL:" -ForegroundColor Yellow
Write-Host "  https://your-render-url.onrender.com" -ForegroundColor White
Write-Host ""

Write-Host "=== Step 8: Rebuild Mobile APK ===" -ForegroundColor Cyan
Write-Host "After updating the API URL, rebuild the APK:" -ForegroundColor Yellow
Write-Host "  cd 'h:\BRENDAH RONO\simple-survey-mobile'" -ForegroundColor White
Write-Host "  eas build --platform android --profile preview" -ForegroundColor White
Write-Host ""

Write-Host "=== Step 9: Keep API Alive (Important!) ===" -ForegroundColor Cyan
Write-Host "Render free tier sleeps after inactivity." -ForegroundColor Yellow
Write-Host "Set up UptimeRobot to prevent this:" -ForegroundColor Yellow
Write-Host "1. Go to https://uptimerobot.com" -ForegroundColor White
Write-Host "2. Create free account" -ForegroundColor White
Write-Host "3. Add monitor for your Render URL" -ForegroundColor White
Write-Host "4. Set interval to every 5 minutes" -ForegroundColor White
Write-Host ""

Write-Host "=== Deployment Complete! ===" -ForegroundColor Green
Write-Host "Your stack is now:" -ForegroundColor Green
Write-Host "  Database  → Aiven MySQL" -ForegroundColor White
Write-Host "  API       → Render" -ForegroundColor White
Write-Host "  Web App   → Vercel" -ForegroundColor White
Write-Host "  Mobile    → Android APK via EAS" -ForegroundColor White
Write-Host ""
Write-Host "Your Render URL: https://simple-survey-api-c3kj.onrender.com" -ForegroundColor Green
