@echo off
pushd "%~dp0"
cd ..
setlocal
set LOGFILE=jshint-warnings.txt
set CHECKCMD=cscript /nologo tools\jslint.hint-for-wsh-2011sep\jshint-for-wsh.js

%CHECKCMD% getserialports.js 2> %LOGFILE%
%CHECKCMD% testscript.js 2>> %LOGFILE%

rem %CHECKCMD% vendor\wmiRegistryTools.js
start %LOGFILE%
popd