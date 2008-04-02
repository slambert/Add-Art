set x=%cd%
set zf="%PROGRAMFILES%\7-Zip"

echo %x%
echo "Duplicating..."
xcopy /s /I addart addart_working
rem move addart addart_renamed
rem move addart_working addart
cd addart_working
copy https://addons.mozilla.org/de/firefox/downloads/file/19510/adblock_plus-0.7.5.3-fx+tb+sm+fl.xpi


%zf%\7z a -tzip "addart-build.xpi" * -r -mx=9
move addart-build.xpi ../.

cd ..
rem rmdir addart /S /Q
rem move addart_renamed addart
rmdir addart_working /S /Q



