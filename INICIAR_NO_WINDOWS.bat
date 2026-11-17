@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ==============================================
echo   ESPERANCAGESTOR - REDE SOLIDARIA ESPERANCA
echo ==============================================
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Instale a versao LTS em https://nodejs.org e tente novamente.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Instalando dependencias. Na primeira vez precisa de internet...
  call npm install
  if errorlevel 1 (
    echo Falha ao instalar dependencias.
    pause
    exit /b 1
  )
)
echo Iniciando o sistema...
start "" http://localhost:5173
echo Mantenha esta janela aberta enquanto usar o sistema.
call npm run dev
pause
