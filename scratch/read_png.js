var stream = new ActiveXObject("ADODB.Stream");
stream.Type = 1; // Binary
stream.Open();
stream.LoadFromFile("c:\\ai-work\\scratch\\icon_rv_mp.png");
var binaryData = stream.Read();
stream.Close();

var xml = new ActiveXObject("MSXML2.DOMDocument");
var el = xml.createElement("element");
el.dataType = "bin.hex";
el.nodeTypedValue = binaryData;
var hex = el.text;

var widthHex = hex.substr(32, 8);
var heightHex = hex.substr(40, 8);
var width = parseInt(widthHex, 16);
var height = parseInt(heightHex, 16);

WScript.Echo("Width: " + width + ", Height: " + height);
