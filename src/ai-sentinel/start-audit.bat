@echo off
echo [🚀] Iniciando AuditorIA AI en modo ligero...
docker compose up -d
echo [✅] Contenedores listos.
echo [🛰️] Iniciando Puente de Auditoria...
start cmd /k "cd src/bridge && node bridge-server.js"
echo [✨] Todo el ecosistema esta corriendo. ¡A programar!
pause