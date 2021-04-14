{!REQUIRESCRIPT("/soap/ajax/51.0/connection.js")} 
{!REQUIRESCRIPT("/soap/ajax/51.0/apex.js")} 
var SesId = '{!GETSESSIONID()}';
var result;
var ObjectName = 'Lead';
var layoutId = '';
var rtName = '';
// USE ONLY IF LEADS HAVE RECORD TYPES
// var rtName = '{!Lead.RecordType}';
var address = '';
var flag = 0;
if (rtName == null || rtName == '') {
    rtName = 'Standard';
}
rtPName = rtName.replace(/ /g, "");
var pageName = 'HL_' + ObjectName + '_' + rtPName;
var rtId;
if (rtName == 'Standard') {
    rtId = 'Master';
} else {
    rtId = rtName;
}
//Check if page exists 
var pgId = '';
var qr = sforce.connection.query("SELECT Id, name FROM ApexPage where name = '" + pageName + "' limit 1");
records = qr.getArray("records");
if (records.length == 1) {
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        pgId = record.Id;
    }
}
if (pgId != null && pgId != '') {
    var qry = sforce.connection.query("SELECT Id, Parent.Name, Parent.Profile.Name, Parent.Profile.Id FROM SetupEntityAccess WHERE Parent.Profile.Id = '{!$User.ProfileId}' AND SetupEntityId in (SELECT Id FROM ApexPage WHERE Name = '" + pageName + "' AND (NamespacePrefix = 'highlighter' OR NamespacePrefix=''))");
    recordsArr = qry.getArray("records");
    if (recordsArr.length == 1) {
        var loc = '/apex/c__' + pageName + '?id={!Lead.Id}';
        window.open(loc, '_self');
    } else {
        var loc = '/{!Lead.Id}/e?retURL={!Lead.Id}';
        window.open(loc, '_self');
    }
} else {
    var loc = '/{!Lead.Id}/e?retURL={!Lead.Id}';
    window.open(loc, '_self');
}
