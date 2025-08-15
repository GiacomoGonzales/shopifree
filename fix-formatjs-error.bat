@echo off
echo Solucionando error de @formatjs...

echo Limpiando cache y dependencias...
rd /s /q .next 2>nul
rd /s /q node_modules 2>nul
del package-lock.json 2>nul

echo Reinstalando dependencias...
npm install

echo Iniciando servidor en puerto 3005...
npm run dev -- -p 3005

pause
