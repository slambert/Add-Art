set x=%cd%
set zf="C:\Program Files\7-Zip"

echo %x%
echo "Duplicating..."
xcopy /s /I addart addart_working
move addart addart_renamed
move addart_working addart
cd addart


echo "zippin"
cd chrome
%zf%\7z a -tzip "addart.jar" * -r -mx=0
rmdir content /S /Q
rmdir skin /S /Q

cd ..
%zf%\7z a -tzip "addart-build.xpi" * -r -mx=9
move addart-build.xpi ../.

cd ..
rmdir addart /S /Q
move addart_renamed addart
