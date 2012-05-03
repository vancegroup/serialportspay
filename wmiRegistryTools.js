/** WMI REGISTRY FUNCTIONS
*	JScript interfaces for WMI Registry Functions
*		version 1.1 (1.24.2008)
*		Matthew Smith
*		http://digivation.net/
*
*
* Simplified ways to read and write the registry using WMI and JScript
*
*	Version History
*	1.1	1.28.2008		provides access to almost every registry functionality of WMI
*	1.0	1.24.2008		provides read and write functionality for values
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/** ENUMERATE WMI REGISTRY VALUES
* This function gets a list of all the values under a given key in the registry
* and returns an array of values and associated data types.
*
* INPUTS: arg1=> computer as string; arg2 => hive (see table); arg3=> key as string
*		hive							variable
*		============================================
*		HKEY_CLASSES_ROOT			HKCR
*		HKEY_CURRENT_USER				HKCU
*		HKEY_LOCAL_MACHINE			HKLM
*		HKEY_USERS					HKU
*		HKEY_CURRENT_CONFIG			HKCC
*		============================================
* OUTPUTS: returns an object containing two arrays: values, which contains
* the names of all values, and types, which contains a string denoting the type of
* each value (related by index, ie value[0] <=> type[0] etc)
*/
function registryToolsEnumValues(computer, hive, key) {
	// first let's convert the hive to the required Hex value
	// this list from MSDN: http://msdn2.microsoft.com/en-us/library/aa390788(VS.85).aspx
	switch(hive){
		default:
			return "error";
		case "HKCR":
			var defKey = 0x80000000;
			break;
		case "HKCU":
			var defKey = 0x80000001;
			break;
		case "HKLM":
			var defKey = 0x80000002;
			break;
		case "HKU":
			var defKey = 0x80000003;
			break;
		case "HKCC":
			var defKey = 0x80000005;
			break;
	}
	// now connect to the WMI registry...
	var WMIRegistry = GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\" + computer + "\\root\\default:StdRegProv");
	
	// now we have to create that fun connector because this method returns TWO
	// values through input variables... oh and it's two arrays ;)
	var enumValues = WMIRegistry.Methods_.Item("EnumValues"); // get a handle on the method...
	var inputParams = enumValues.InParameters.SpawnInstance_(); // now we have somewhere to place our inputs
	// the MOF for this function is here: http://msdn2.microsoft.com/en-us/library/aa390388(VS.85).aspx
	inputParams.hDefKey = defKey; // set the hive
	inputParams.sSubKeyName = key; // set the key to look in
	
	// now lets run that sucker and collect our outputs
	var outputParams = WMIRegistry.ExecMethod_(enumValues.Name, inputParams);
	// outputParams should now contain two arrays, one with the value names and one with the data types.
	var returnParams = new Array(); // create a new container
	returnParams.values = VBArray(outputParams.sNames).toArray(); // convert and store values array

	// before storing the type, let's convert it to strings that make more sense. see 
	// http://msdn2.microsoft.com/en-us/library/aa390388(VS.85).aspx for more info
	var tempArray = new Array(); // temporary storage!
	tempArray = VBArray(outputParams.Types).toArray(); // now we fill the temp storage with our converted array of types
	var count = 0; // create a loop counter
	var length = outputParams.Types.length; // get the length of the Types array - this is simply to allow the  creation of a properly sized array
	returnParams.types = new Array(length); // create and size our new output types array
	
	// now lets loop and substitute!	
	while( count < tempArray.length ) {
		// transform the array of id numbers to readable strings
		if( tempArray[count] == 1 ) { returnParams.types[count] = "REG_SZ"; }
		else if( tempArray[count] == 2 ) { returnParams.types[count] = "REG_EXPAND_SZ"; }
		else if( tempArray[count] == 3 ) { returnParams.types[count] = "REG_BINARY"; }
		else if( tempArray[count] == 4 ) { returnParams.types[count] = "REG_DWORD"; }
		else if( tempArray[count] == 7 ) { returnParams.types[count] = "REG_MULTI_SZ"; }
		else { returnParams.types[count] = "UNDEF"; }
		
		count++; // increment counter
	} 
	
	//returnParams.types = VBArray(outputParams.Types).toArray();
	return returnParams; // send the object back ... remember, it contains two arrays - values & types
	
}

/** READ WMI REGISTRY VALUE
* reads the registry through WMI
* easy to do in VB but trickier in JS
* this function should simplify matters
* INPUTS:
*	computer => computer name as string, use "." for local
*	hive => use this list
*		hive							variable
*		============================================
*		HKEY_CLASSES_ROOT			HKCR
*		HKEY_CURRENT_USER				HKCU
*		HKEY_LOCAL_MACHINE			HKLM
*		HKEY_USERS					HKU
*		HKEY_CURRENT_CONFIG			HKCC
*		============================================
*	key => the key you want to read, remember to use "\\" for the seperator
*	value => the name of the value to read
*	type => the type of value you wish to read. see list:
*		type	
*		============================
*		REG_BINARY
*		REG_DWORD
*		REG_EXPAND_SZ
*		REG_MULTI_SZ
*		REG_SZ
*		============================
* OUTPUTS: the value:
*		type				returns
*		===========================
*		REG_BINARY		int
*		REG_DWORD		int
*		REG_EXPAND_SZ	string
*		REG_MULTI_SZ		string array
*		REG_SZ			string
*		===========================
*/
function registryToolsReadValue(computer, hive, key, value, type) {
	// first let's convert the hive to the required Hex value
	// this list from MSDN: http://msdn2.microsoft.com/en-us/library/aa390788(VS.85).aspx
	switch(hive){
		default:
			return "error";
		case "HKCR":
			var defKey = 0x80000000;
			break;
		case "HKCU":
			var defKey = 0x80000001;
			break;
		case "HKLM":
			var defKey = 0x80000002;
			break;
		case "HKU":
			var defKey = 0x80000003;
			break;
		case "HKCC":
			var defKey = 0x80000005;
			break;
	}
	// lets see if we can set up the type now
	// documentation: http://msdn2.microsoft.com/en-us/library/aa392722(VS.85).aspx
	// we could actually use the EnumValues method to retrieve all the values under key,
	// along with each type, then search through the values array until we find the one passed
	// to the function, then use the array index to find the type... but for now we'll let the user
	// do the work... ;)
	switch(type){
		default:
			return "error";
		case "REG_BINARY":
			var readType = "GetBinaryValue";
			break;
		case "REG_DWORD":
			var readType = "GetDWORDValue";
			break;
		case "REG_EXPAND_SZ":
			var readType = "GetExpandedStringValue";
			break;
		case "REG_MULTI_SZ":
			var readType = "GetMultiStringValue";
			break;
		case "REG_SZ":
			var readType = "GetStringValue";
			break;
	}
	// now connect to the WMI registry...
	var WMIRegistry = GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\" + computer + "\\root\\default:StdRegProv");
	// now for the crazy part. I referred to this page: http://jscriptman.blogspot.com/2006/03/installed-software-on-pc-via-wmi.html
	// for more information. Basically, JS doesn't support passing the return variable in the function call, so we have to go around the long way to
	// get the info we want!
	// of course this also allows us to use the TYPE switch above ... so it's a good and bad thing.
	var readMethod = WMIRegistry.Methods_.Item(readType); // get the method
	var inputParams = readMethod.InParameters.SpawnInstance_(); // lets create an input object ... gag
	// see here: http://msdn2.microsoft.com/en-us/library/aa392722(VS.85).aspx to find input params. the imputs are the same for
	// all types, the only change is the output type.
	inputParams.hDefKey = defKey; // we chose this above
	inputParams.sSubKeyName = key; // this was an input to the function
	inputParams.sValueName = value; // also an input
	// now lets obtain some data!
	// remember, this is an OBJECT with various properties. A list of the properties is can be found at the above site (one of the input params).
	// the output will either be the sValue or uValue property, depending on the type. it could also be an array... so lets do some switching!
	var outputParams = WMIRegistry.ExecMethod_(readMethod.Name, inputParams);

	switch(type){
		default:
			return "error";
		case "REG_BINARY":
			// binary values are returned as arrays. VB arrays, unfortnately. So we must convert them!
			return VBArray(outputParams.uValue).toArray(); // return the JS array of binary values
		case "REG_DWORD":
			return outputParams.uValue; // nothing but a simple return
		case "REG_EXPAND_SZ":
			return outputParams.sValue; // simple return
		case "REG_MULTI_SZ":
			return VBArray(outputParams.sValue).toArray(); // works like a charm
		case "REG_SZ":
			return outputParams.sValue; // simple return
	}
}

/** WRITE WMI REGISTRY VALUE
* writes to the registry through WMI
* easy to do in VB but trickier in JS
* this function should simplify matters
* INPUTS:
*	computer => computer name as string, use "." for local
*	hive => use this list
*		hive							variable
*		============================================
*		HKEY_CLASSES_ROOT			HKCR
*		HKEY_CURRENT_USER				HKCU
*		HKEY_LOCAL_MACHINE			HKLM
*		HKEY_USERS					HKU
*		HKEY_CURRENT_CONFIG			HKCC
*		============================================
*	key => the key you want to read, remember to use "\\" for the seperator
*	value => the name of the value to set
*	type => the type of value you wish to set. see list:
*		type				input data type
*		==================================================
*		REG_BINARY		array of ints
*		REG_DWORD		hex or decimal number (int)
*		REG_EXPAND_SZ	tring
*		REG_MULTI_SZ		array of strings
*		REG_SZ			tring
*		==================================================
*	data => what you want to write (using above type)
* OUTPUTS: none for now
*/
function registryToolsWriteValue(computer, hive, key, value, type, data) {
	// first let's convert the hive to the required Hex value
	// this list from MSDN: http://msdn2.microsoft.com/en-us/library/aa390788(VS.85).aspx
	switch(hive){
		default:
			return "error";
		case "HKCR":
			var defKey = 0x80000000;
			break;
		case "HKCU":
			var defKey = 0x80000001;
			break;
		case "HKLM":
			var defKey = 0x80000002;
			break;
		case "HKU":
			var defKey = 0x80000003;
			break;
		case "HKCC":
			var defKey = 0x80000005;
			break;
	}
	// select the type to write
	// documentation: http://msdn2.microsoft.com/en-us/library/aa392722(VS.85).aspx
	switch(type){
		default:
			return "error";
		case "REG_BINARY":
			var writeType = "SetBinaryValue";
			break;
		case "REG_DWORD":
			var writeType = "SetDWORDValue";
			break;
		case "REG_EXPAND_SZ":
			var writeType = "SetExpandedStringValue";
			break;
		case "REG_MULTI_SZ":
			var writeType = "SetMultiStringValue";
			break;
		case "REG_SZ":
			var writeType = "SetStringValue";
			break;
	}
	// now connect to the WMI registry...
	var WMIRegistry = GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\" + computer + "\\root\\default:StdRegProv");
	// I am pretty sure we could do this using the simple WMIRegistry.Set<DataType>Value call with the proper
	// variables passed into the function. However, since I just copied and pasted the read function, and we
	// already had the nice switch block above, we'll just use the complex "reflection" type connection.
	// for more info, look at MSDN or the site mentioned above.
	var writeMethod = WMIRegistry.Methods_.Item(writeType); // get the method
	var inputParams = writeMethod.InParameters.SpawnInstance_(); // lets create an input object ... gag
	// see here: http://msdn2.microsoft.com/en-us/library/aa392722(VS.85).aspx to find input params. the inputs are the same for
	// all types, the only change is the output type.
	inputParams.hDefKey = defKey; // we chose this above
	inputParams.sSubKeyName = key; // this was an input to the function
	inputParams.sValueName = value; // also an input
	// now we will use the switch to set the proper data input parameter!
	switch(type){
		default:
			return "error";
		case "REG_BINARY":
			// binary values are passed as arrays
			inputParams.uValue = data; // pass a number array
			break;
		case "REG_DWORD":
			inputParams.uValue = data; // lets just pass the data!
			break;
		case "REG_EXPAND_SZ":
			inputParams.sValue = data; // pass the data
			break;
		case "REG_MULTI_SZ":
			inputParams.sValue = data; // pass the string array
			break;
		case "REG_SZ":
			inputParams.sValue = data; // pass the data
			break;
	}
	// execute the operation. any outputs will go to outputParams, but it should be empty.
	var outputParams = WMIRegistry.ExecMethod_(writeMethod.Name, inputParams);
}

/** DELETE WMI REGISTRY VALUE
* INPUTS: computer = computer as string, hive = hive abbr. as string, see table, key = key as string, value = value as string
*		hive							variable
*		============================================
*		HKEY_CLASSES_ROOT			HKCR
*		HKEY_CURRENT_USER				HKCU
*		HKEY_LOCAL_MACHINE			HKLM
*		HKEY_USERS					HKU
*		HKEY_CURRENT_CONFIG			HKCC
*		============================================
* OUTPUTS: none
*/
function registryToolsDeleteValue(computer, hive, key, value) {
	// first let's convert the hive to the required Hex value
	// this list from MSDN: http://msdn2.microsoft.com/en-us/library/aa390788(VS.85).aspx
	switch(hive){
		default:
			return "error";
		case "HKCR":
			var defKey = 0x80000000;
			break;
		case "HKCU":
			var defKey = 0x80000001;
			break;
		case "HKLM":
			var defKey = 0x80000002;
			break;
		case "HKU":
			var defKey = 0x80000003;
			break;
		case "HKCC":
			var defKey = 0x80000005;
			break;
	}
	// now connect to the WMI registry...
	var WMIRegistry = GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\" + computer + "\\root\\default:StdRegProv");
	// and now for the juice
	WMIRegistry.DeleteValue(defKey, key, value);
}

/** ENUMERATE WMI REGISTRY KEYS
* This function gets a list of all the values under a given key in the registry
* and returns an array of values and associated data types.
*
* INPUTS: arg1=> computer as string; arg2 => hive (see table); arg3=> parent key as string
*		hive							variable
*		============================================
*		HKEY_CLASSES_ROOT			HKCR
*		HKEY_CURRENT_USER				HKCU
*		HKEY_LOCAL_MACHINE			HKLM
*		HKEY_USERS					HKU
*		HKEY_CURRENT_CONFIG			HKCC
*		============================================
* OUTPUTS: returns an array of strings with the names of the subkeys
*/
function registryToolsEnumKeys(computer, hive, key) {
	// first let's convert the hive to the required Hex value
	// this list from MSDN: http://msdn2.microsoft.com/en-us/library/aa390788(VS.85).aspx
	switch(hive){
		default:
			return "error";
		case "HKCR":
			var defKey = 0x80000000;
			break;
		case "HKCU":
			var defKey = 0x80000001;
			break;
		case "HKLM":
			var defKey = 0x80000002;
			break;
		case "HKU":
			var defKey = 0x80000003;
			break;
		case "HKCC":
			var defKey = 0x80000005;
			break;
	}
	// now we connect
	var WMIRegistry = GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\" + computer + "\\root\\default:StdRegProv");
	// now lets get the method (we'll be using reflection again)
	var enumKey = WMIRegistry.Methods_.Item("EnumKey"); // get a handle on the method...
	var inputParams = enumKey.InParameters.SpawnInstance_(); // object for inputs...
	// and now we load up the inputs... see http://msdn2.microsoft.com/en-us/library/aa390387(VS.85).aspx
	inputParams.hDefKey = defKey; // set the hive
	inputParams.sSubKeyName = key; // set the key to look in
	// ok lets do this
	var outputParams = WMIRegistry.ExecMethod_(enumKey.Name, inputParams);
	// now lets convert the array (just returns a single array of key names) and return!
	return VBArray(outputParams.sNames).toArray();
}

/** CREATE WMI REGISTRY KEY
* INPUTS: computer = computer as string, hive = hive abbr. as string, see table, key = key as string
*		hive							variable
*		============================================
*		HKEY_CLASSES_ROOT			HKCR
*		HKEY_CURRENT_USER				HKCU
*		HKEY_LOCAL_MACHINE			HKLM
*		HKEY_USERS					HKU
*		HKEY_CURRENT_CONFIG			HKCC
*		============================================
* OUTPUTS: none
*/
function registryToolsCreateKey(computer, hive, key) {
	// first let's convert the hive to the required Hex value
	// this list from MSDN: http://msdn2.microsoft.com/en-us/library/aa390788(VS.85).aspx
	switch(hive){
		default:
			return "error";
		case "HKCR":
			var defKey = 0x80000000;
			break;
		case "HKCU":
			var defKey = 0x80000001;
			break;
		case "HKLM":
			var defKey = 0x80000002;
			break;
		case "HKU":
			var defKey = 0x80000003;
			break;
		case "HKCC":
			var defKey = 0x80000005;
			break;
	}
	// now connect to the WMI registry...
	var WMIRegistry = GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\" + computer + "\\root\\default:StdRegProv");
	// and do it
	WMIRegistry.CreateKey(defKey, key);
}

/** DELETE WMI REGISTRY KEY
* INPUTS: computer = computer as string, hive = hive abbr. as string, see table, key = key as string
*		hive							variable
*		============================================
*		HKEY_CLASSES_ROOT			HKCR
*		HKEY_CURRENT_USER				HKCU
*		HKEY_LOCAL_MACHINE			HKLM
*		HKEY_USERS					HKU
*		HKEY_CURRENT_CONFIG			HKCC
*		============================================
* OUTPUTS: none
*/
function registryToolsDeleteKey(computer, hive, key) {
	// first let's convert the hive to the required Hex value
	// this list from MSDN: http://msdn2.microsoft.com/en-us/library/aa390788(VS.85).aspx
	switch(hive){
		default:
			return "error";
		case "HKCR":
			var defKey = 0x80000000;
			break;
		case "HKCU":
			var defKey = 0x80000001;
			break;
		case "HKLM":
			var defKey = 0x80000002;
			break;
		case "HKU":
			var defKey = 0x80000003;
			break;
		case "HKCC":
			var defKey = 0x80000005;
			break;
	}
	// now connect to the WMI registry...
	var WMIRegistry = GetObject("winmgmts:{impersonationLevel=impersonate}!\\\\" + computer + "\\root\\default:StdRegProv");
	// and now for the juice
	WMIRegistry.DeleteKey(defKey, key);
}

