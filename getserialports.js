function include(fileName) {
	var fso = new ActiveXObject("Scripting.FileSystemObject"); // create the file system object
	if( !fso.FileExists(fileName) ) { return -1; } // check for file existance and fail if no file
	var file = fso.OpenTextFile(fileName);
	var stream = file.ReadAll();
	file.Close();
	return stream;
}
eval( include("vendor/wmiRegistryTools.js") );


SerialPortProxy = function(computer, Caption, DeviceID) {
	var HKEY_LOCAL_MACHINE = 0x80000002;
	var WshShell = WScript.CreateObject("WScript.Shell");
	var self = this;
	self.computer = computer;
	self.caption = Caption;
	self.deviceid = DeviceID;
	self.keyBase = "SYSTEM\\CurrentControlSet\\Enum\\" + DeviceID;
	self.isEnumerationEnabled = function() {
		var ret = registryToolsReadValue(self.computer, "HKLM", self.keyBase + "\\Device Parameters", "SkipEnumerations", "REG_DWORD");
		return !( ret == -1 || ret == 0xFFFFFFFF); // -1 is 0xFFFFFFFF
	};

	self.disableEnumeration = function() {
		registryToolsWriteValue(self.computer, "HKLM", self.keyBase + "\\Device Parameters", "SkipEnumerations", "REG_DWORD", 0xFFFFFFFF);
	}
	self.enableEnumeration = function() {
		registryToolsWriteValue(self.computer, "HKLM", self.keyBase + "\\Device Parameters", "SkipEnumerations", "REG_DWORD", 0x0);
	}
}
getSerialPorts = function (computer) {

	var wbemFlagReturnImmediately = 0x10;
	var wbemFlagForwardOnly = 0x20;

	var objWMIService = GetObject("winmgmts:\\\\" + computer + "\\root\\CIMV2");
	var colItems = objWMIService.ExecQuery("SELECT Caption, DeviceID FROM Win32_PnPEntity WHERE Service='Serial'", "WQL", wbemFlagReturnImmediately | wbemFlagForwardOnly);

	var enumItems = new Enumerator(colItems);
	var ret = [];
	for (; !enumItems.atEnd(); enumItems.moveNext()) {
		var objItem = enumItems.item();
		ret.push(new SerialPortProxy(computer, objItem.Caption, objItem.DeviceID));
	}
	return ret;
}
