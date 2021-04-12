{!REQUIRESCRIPT("/soap/ajax/51.0/connection.js")}
{!REQUIRESCRIPT("/soap/ajax/51.0/apex.js")}
var SesId = '{!GETSESSIONID()}';
var result;
var ObjectName = 'Contact';
var layoutId = '';
var rtName = '';
// USE ONLY IF CONTACTS HAVE RECORD TYPES
// var rtName = '{!Contact.RecordType}';
var count = 0;
var divNum = 0;
var countUndefined = 0;
if (rtName == null || rtName == '') {
    rtName = 'Standard';
}
var rtPName = rtName.replace(/ /g, "");
var pageName = 'HL_' + ObjectName + '_' + rtPName;
var rtId;
if (rtName == 'Standard') {
    rtId = 'Master';
} else {
    rtId = rtName;
}
var recordTID = '';
var pgId = '';
var addressSet = false;
var res = sforce.apex.execute("highlighter.getFieldIDs", "getIds", {objectName: 'Contact'}); 
var a = JSON.parse(res); 
var qr = sforce.connection.query("SELECT Id, name FROM ApexPage where name = '" + pageName + "' limit 1");
records = qr.getArray("records");
if (records.length == 1) {
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        pgId = record.Id;
    }
}
result = sforce.connection.describeLayout(ObjectName, null, null);
var objectDescribeData = '';
objectDescribeData = sforce.connection.describeSObject(ObjectName);
var recordTypeMapping = result.getArray("recordTypeMappings");
for (var i = 0; i < recordTypeMapping.length; i++) {
    var rectId = recordTypeMapping[i].name;
    //rectId = rectId.substring(0, 15);
    if (rtId == rectId) {
        //recordTID =  recordTypeMapping[i].recordTypeId;
        layoutId = recordTypeMapping[i].layoutId;
        console.log('###: ' + recordTypeMapping[i].recordTypeId);
        console.log('###: ' + recordTypeMapping[i].layoutId);
    }
}
//Retreiving layout
var layoutActivity = result.getArray("layouts");
console.log('layoutActivity : ' + layoutActivity);
for (var i = 0; i < layoutActivity.length; i++) {
    console.log('Id: ' + layoutActivity[i].id); // get ID
    if (layoutActivity[i].id == layoutId) {
        var body = '';
        body = '\\n\\t\\t<apex:pageBlock title=\'' + ObjectName + ' Edit\' mode=\'edit\' id=\'pb1\'>';
        body += '\\n\\t\\t\\t<apex:pageBlockButtons location=\'both\' id=\'pbb1\'>\\n\\t\\t\\t\\t<apex:commandButton value=\'Save\' id=\'svBtn\' onclick=\'validate(event,false);return false;\'/>\\n\\t\\t\\t\\t<apex:commandButton value=\'Save & New\' onclick=\'validate(event,true);return false;\'/>\\n\\t\\t\\t\\t<apex:commandButton value=\'Cancel\' action=\'\{\!cancel}\' />\\n\\t\\t\\t</apex:pageBlockButtons>\\n\\t\\t\\t<div id=\'errorDiv\' style=\'color:#c00;display:none;font-weight:bold\'><center>Error: Invalid Data. <br/>Review all error messages below to correct your data.</center></div>';
        //Retrieving Edit section
        var detailLayoutSection = layoutActivity[i].getArray("editLayoutSections");
        for (var j = 0; j < detailLayoutSection.length; j++) {
            
            
			body += '\\n\\t\\t\\t<apex:pageBlockSection title=\'' + detailLayoutSection[j].heading + '\' columns=\'' + detailLayoutSection[j].columns + '\'>';
			//Getting the rows of Layout 
			var layoutRows = detailLayoutSection[j].getArray("layoutRows");
			console.log('section: ' + layoutRows);
			for (var k = 0; k < layoutRows.length; k++) {
				//Getting items inside rows 
				var layoutItems = layoutRows[k].getArray("layoutItems");
				for (var l = 0; l < layoutItems.length; l++) {
					
					if (layoutItems[l].placeholder == 'true') {
						body += '\\n\\t\\t\\t\\t<apex:pageBlockSectionItem></apex:pageBlockSectionItem>';
					}
					//Getting the layout components inside layoutItems 
					var layoutComponents = layoutItems[l].getArray("layoutComponents");
					for (var m = 0; m < layoutComponents.length; m++) {
						if(layoutComponents[m].type=='EmptySpace'){
							body += '\\n\\t\\t\\t\\t<apex:pageBlockSectionItem></apex:pageBlockSectionItem>';
						}
						//Getting fields of Layout Components 
						for (var n = 0; n < objectDescribeData.fields.length; n++) {
							var field = objectDescribeData.fields[n];
							if (field.name == layoutComponents[m].value) {
								var idVal = 'id_'+a[layoutItems[l].label];
								if(idVal=='id_undefined'){
									idVal = 'id_'+countUndefined;
									countUndefined++;
								}
								if (layoutComponents[m].value != 'MailingAddress' && layoutComponents[m].value != 'OtherAddress') {
									if (layoutComponents[m].value == 'Name') { 
										divNum++; 
										body += '\\n\\t\\t\\t\\t<apex:inputField id=\'name_firstcon2\' value=\'\{\!Contact.firstName}\' required=\'false\' tabOrderHint=\'' + layoutComponents[m].tabOrder + '\' onkeypress=\'noenter(event)\'>\\n\\t\\t\\t\\t\\t<apex:actionSupport event=\'onkeyup\' rerender=\'pg\'/>\\n\\t\\t\\t\\t</apex:inputField>\\n\\t\\t\\t\\t<apex:pageBlockSectionItem></apex:pageBlockSectionItem>\\n\\t\\t\\t\\t<apex:inputField id=\'name_lastcon2\' value=\'\{\!Contact.LastName}\' required=\'' + layoutItems[l].required + '\' tabOrderHint=\'' + layoutComponents[m].tabOrder + '\' onkeypress=\'noenter(event)\' styleClass=\'reqClass\'>\\n\\t\\t\\t\\t\\t<apex:actionSupport event=\'onkeyup\' rerender=\'pg\'/>\\n\\t\\t\\t\\t\\t<div id=\'div' + divNum + '\' style=\'color:#d74c3b;display:none;\' class=\'errorMsg\'>Error: You must enter a value</div>\\n\\t\\t\\t\\t</apex:inputField>' 
									} else { 
										if (detailLayoutSection[j].columns == 1 && layoutComponents[m].displayLines > 1 && field.type=='textarea') {
											if (layoutItems[l].required == 'true') {
												divNum++;
												body += '\\n\\t\\t\\t\\t<apex:inputField id=\''+idVal+'\' value=\'\{\!Contact.' + layoutComponents[m].value + '}\' required=\'' + layoutItems[l].required + '\' tabOrderHint=\'' + layoutComponents[m].tabOrder + '\' style=\'width:473px;height:50px;\' onkeypress=\'noenter(event)\' styleClass=\'reqClass\'>\\n\\t\\t\\t\\t\\t<apex:actionSupport event=\'onkeyup\' rerender=\'pg\'/>\\n\\t\\t\\t\\t\\t<div id=\'div' + divNum + '\' style=\'color:#d74c3b;display:none;\' class=\'errorMsg\'>Error: You must enter a value</div>\\n\\t\\t\\t\\t</apex:inputField>';
											} else {
												body += '\\n\\t\\t\\t\\t<apex:inputField id=\''+idVal+'\' value=\'\{\!Contact.' + layoutComponents[m].value + '}\' required=\'' + layoutItems[l].required + '\' tabOrderHint=\'' + layoutComponents[m].tabOrder + '\' style=\'width:473px;height:50px;\' onkeypress=\'noenter(event)\'>\\n\\t\\t\\t\\t\\t<apex:actionSupport event=\'onkeyup\' rerender=\'pg\'/>\\n\\t\\t\\t\\t</apex:inputField>';
											}
										} else {
											if (layoutComponents[m].value == 'OwnerId') {
												body += '\\n\\t\\t\\t\\t<apex:outputText value=\'\{\!ownerName}\' label=\'Contact Owner\'/>';
											} else {
												if (layoutItems[l].required == 'true') {
													divNum++;
													body += '\\n\\t\\t\\t\\t<apex:inputField id=\''+idVal+'\' value=\'\{\!Contact.' + layoutComponents[m].value + '}\' required=\'' + layoutItems[l].required + '\' tabOrderHint=\'' + layoutComponents[m].tabOrder + '\' onkeypress=\'noenter(event)\' styleClass=\'reqClass\'>\\n\\t\\t\\t\\t\\t<apex:actionSupport event=\'onkeyup\' rerender=\'pg\'/>\\n\\t\\t\\t\\t\\t<div id=\'div' + divNum + '\' style=\'color:#d74c3b;display:none;\' class=\'errorMsg\'>Error: You must enter a value</div>\\n\\t\\t\\t\\t</apex:inputField>';
												} else {
													body += '\\n\\t\\t\\t\\t<apex:inputField id=\''+idVal+'\' value=\'\{\!Contact.' + layoutComponents[m].value + '}\' required=\'' + layoutItems[l].required + '\' tabOrderHint=\'' + layoutComponents[m].tabOrder + '\' onkeypress=\'noenter(event)\'>\\n\\t\\t\\t\\t\\t<apex:actionSupport event=\'onkeyup\' rerender=\'pg\'/>\\n\\t\\t\\t\\t</apex:inputField>';
												}
											}
										}
									}							
								} else {	
									var addrArray = [];
									var addressComponents = layoutComponents[m].getArray("components");						
									if(layoutItems[l+1] != undefined){
										if(layoutItems[l+1].label=='Mailing Address' || layoutItems[l+1].label=='Other Address'){
											addressSet = true;
											var addressLayoutComponents = layoutItems[l+1].getArray("layoutComponents");					
											for (var ad = 0; ad < addressLayoutComponents.length; ad++){
												var addressTwoComponents = addressLayoutComponents[m].getArray("components");
											}
											for(var p=0;p<addressComponents.length;p++){
												var addrIdVal='';					
												addrIdVal = 'id_'+a[addressComponents[p].value];
												if(addrIdVal=='id_undefined'){
													addrIdVal = 'idadd_'+countUndefined;
													countUndefined++;
												}
												if (layoutItems[l].required == 'true') {
													divNum++;													
													body += '\\n\\t\\t\\t\\t<apex:inputField id=\''+addrIdVal+'\' value=\'\{\!Contact.' + addressComponents[p].value + '}\' required=\'' + layoutItems[l].required + '\' tabOrderHint=\'' + addressComponents[p].tabOrder + '\' onkeypress=\'noenter(event)\' styleClass=\'reqClass\'>\\n\\t\\t\\t\\t\\t<apex:actionSupport event=\'onkeyup\' rerender=\'pg\'/>\\n\\t\\t\\t\\t\\t<div id=\'div' + divNum + '\' style=\'color:#d74c3b;display:none;\' class=\'errorMsg\'>Error: You must enter a value</div>\\n\\t\\t\\t\\t</apex:inputField>\\n\\t\\t\\t\\t<apex:inputField value=\'\{\!Contact.' + addressTwoComponents[p].value + '}\' required=\'' + layoutItems[l+1].required + '\' tabOrderHint=\'' + addressTwoComponents[p].tabOrder + '\' onkeypress=\'noenter(event)\' styleClass=\'reqClass\'>\\n\\t\\t\\t\\t\\t<apex:actionSupport event=\'onkeyup\' rerender=\'pg\'/>\\n\\t\\t\\t\\t\\t<div id=\'div' + divNum + '\' style=\'color:#d74c3b;display:none;\' class=\'errorMsg\'>Error: You must enter a value</div>\\n\\t\\t\\t\\t</apex:inputField>';
												} else {
													body += '\\n\\t\\t\\t\\t<apex:inputField id=\''+addrIdVal+'\' value=\'\{\!Contact.' + addressComponents[p].value + '}\' required=\'' + layoutItems[l].required + '\' tabOrderHint=\'' + addressComponents[p].tabOrder + '\' onkeypress=\'noenter(event)\'>\\n\\t\\t\\t\\t\\t<apex:actionSupport event=\'onkeyup\' rerender=\'pg\'/>\\n\\t\\t\\t\\t</apex:inputField>\\n\\t\\t\\t\\t<apex:inputField value=\'\{\!Contact.' + addressTwoComponents[p].value + '}\' required=\'' + layoutItems[l+1].required + '\' tabOrderHint=\'' + addressTwoComponents[p].tabOrder + '\' onkeypress=\'noenter(event)\'>\\n\\t\\t\\t\\t\\t<apex:actionSupport event=\'onkeyup\' rerender=\'pg\'/>\\n\\t\\t\\t\\t</apex:inputField>';
												}
											}							
										} 
									}
									
									if(addressSet==false){
										for(var p=0;p<addressComponents.length;p++){
											var addrIdVal;									
											addrIdVal = 'id_'+a[addressComponents[p].value];
											if(addrIdVal=='id_undefined'){
												addrIdVal = 'idadd2_'+countUndefined;
												countUndefined++;
											}
											if (layoutItems[l].required == 'true') {
												divNum++;
												body += '\\n\\t\\t\\t\\t<apex:inputField id=\''+addrIdVal+'\'  value=\'\{\!Contact.' + addressComponents[p].value + '}\' required=\'' + layoutItems[l].required + '\' tabOrderHint=\'' + addressComponents[p].tabOrder + '\' onkeypress=\'noenter(event)\' styleClass=\'reqClass\'>\\n\\t\\t\\t\\t\\t<apex:actionSupport event=\'onkeyup\' rerender=\'pg\'/>\\n\\t\\t\\t\\t\\t<div id=\'div' + divNum + '\' style=\'color:#d74c3b;display:none;\' class=\'errorMsg\'>Error: You must enter a value</div>\\n\\t\\t\\t\\t</apex:inputField><apex:pageBlockSectionItem/>';
											} else {
												body += '\\n\\t\\t\\t\\t<apex:inputField id=\''+addrIdVal+'\'  value=\'\{\!Contact.' + addressComponents[p].value + '}\' required=\'' + layoutItems[l].required + '\' tabOrderHint=\'' + addressComponents[p].tabOrder + '\' onkeypress=\'noenter(event)\'>\\n\\t\\t\\t\\t\\t<apex:actionSupport event=\'onkeyup\' rerender=\'pg\'/>\\n\\t\\t\\t\\t</apex:inputField><apex:pageBlockSectionItem/>';
											}
										}
									}							
								}
							}
						}
					}
				}
			}
			body += '\\n\\t\\t\\t</apex:pageBlockSection>';
        }
        body += '\\n\\t\\t</apex:pageBlock>';
        console.log('#####: ' + body);
        var result = sforce.apex.execute("highlighter.CreateResource", "CreatePage", {
            ObjectName: 'Contact',
            pageBody: body,
            pageId: pgId,
            pageName: pageName
        });
        if (result == 'success') {
            var loc = '/apex/' + pageName + '?id={!Contact.Id}';
            window.open(loc, '_self');
        } else {
            window.location = window.location;
        }
    }
}
