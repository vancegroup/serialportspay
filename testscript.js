function include(fileName) {
	var fso = new ActiveXObject("Scripting.FileSystemObject"); // create the file system object
	if( !fso.FileExists(fileName) ) { return -1; } // check for file existance and fail if no file
	var file = fso.OpenTextFile(fileName);
	var stream = file.ReadAll();
	file.Close();
	return stream;
}
eval( include("getserialports.js") );




var ports = getSerialPorts(".");

for (var portIdx in ports) {
	var port = ports[portIdx];
	WScript.Echo(port);
	WScript.Echo(port.caption);
	WScript.Echo(port.isEnumerationEnabled() ? "Currently Enumerating!" : "Enumeration disabled like it ought to be");
	WScript.Echo(port.disableEnumeration());
	WScript.Echo(port.isEnumerationEnabled());
	WScript.Echo(port.enableEnumeration());
	WScript.Echo(port.isEnumerationEnabled());
}