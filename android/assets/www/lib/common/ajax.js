function _ajax() {
	
	this.xmlHttp = new XMLHttpRequest();
	
	this.cancel = function() {
		var xmlHttp = this.xmlHttp;
		xmlHttp.abort();
		xmlHttp.onreadyStateChange = function() {}				
	}
		
	this.parseResponse = function(reply, responseType) {
		if(responseType == 'text') {
			return reply.responseText;
		}else if(responseType == 'xml') {
			return reply.responseXML;
		}else {
			return this.parseJSON(reply.responseText);
		}		
	}

	this.get = function(rURL, callback) {
		var aux = this;	
		var xmlHttp = this.xmlHttp;
		xmlHttp.onreadystatechange = function() {			
			if(xmlHttp.readyState == 4) {
			//	console.log(xmlHttp.responseText);
				try {
					response = JSON.parse(xmlHttp.responseText);					
				}catch(e) {
					response = {"error":-1, "message" : "Error parsing response"};
				}
				if(response == "" || response.error == -1) {
					alert("Wops! Ha ocurrido un error al buscar la informacion. Intantalo nuevamente!")
				}								
				callback(response);			
			}		
		};				
		xmlHttp.open('GET', rURL, true);
		xmlHttp.send(null);		
	}	
	
	this.onResponseError = function(response) {
		alert('error response');
	}
	
}
