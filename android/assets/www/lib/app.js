function _app(){

	this.ajax  = new _ajax();
	
	this.baseHost = "http://urucas.com/tmps/"
	this.baseURL  = this.baseHost;

	this.playlist = [];
	this.current = null;
	this.options = {
		repeat : false,
		shiffle: false
	}	

	this.cancelAjaxRequest = function() {
		this.ajax.cancel();
	}

	this.view = new _view();

	this.publicRequest = function(url, callback) {

		$(".spinner").show();
		this.ajax.get(this.baseURL + url, function(data){
			$(".spinner").hide();
			if(data == null) {
				alert("Ha ocurrido un error al intentar recuperar los datos, intente nuevamente o verifique su conexion!");
			}
			callback(data);
		});
	}

	this.prepareOptions = function() {
		var options = app.options;
		var repeatClass  = app.options.repeat   ? "repeat_active" : "repeat";
		$("#repeatBtt").removeClass("repeat_active");
		$("#repeatBtt").removeClass("repeat");
		$("#repeatBtt").addClass(repeatClass);

		// to do!
		var shuffleClass  = app.options.shuffle ? "shuffle_active" : "shuffle";
	}

	this.lastSearch = {
		q : "",
		page : 1
	}

	this.showPlaylist = function() {
	
		$(".container").hide();
		$("#playlist_container").show();

		app.view.pushHistory("app.showPlaylist()");

		var playlist = app.playlist;
		var len = playlist.length;
		if(!len) {
			$("#list").html('<li class="empty-list">No se han agregado items a la lista de reproduccion</li>');
			return;
		}

		var html = "";
		for(var i=0;i<len;i++) {
			var track = playlist[i];

			var trackInfo = [
				'track-id="'+track.id+'"',
				'track-name="'+track.name+'"',
				'track-star="'+track.star+'"',
				'track-time="'+track.time+'"',
				'track-album-title="'+track.album+'"',
				'track-album-cover="'+track.cover+'"',
				'track-user-="'+track.user+'"',
			].join(" ");

			var aux = [
				'<li class="list-item">',
				'   <img src="'+track.cover+'" class="cover" />',
				'	<button class="delete" track-id="'+track.id+'" onclick="app.removeFromPlaylist(this)"></button>',
				'	<button class="play" '+trackInfo+' onclick="app.openFromPlaylist(this)"></button>',
				'	<p class="time"> '+track.time+'</p>',
				'	<p class="name">'+(i+1)+'. '+track.name+'</p>',
				'</li>'
			].join("");
			html += aux;	
		}
		$("#list").html(html);
	}

	this.removeFromPlaylist = function(trackInfo) {
		
		var tid = trackInfo.getAttribute("track-id");
		if(app.current != null && tid == app.current.id) {
			alert("No se puede eliminar la cancion de la lista ya que la misma se esta reproduciendo!");
			return;
		}

		var playlist = app.playlist;
		var len = playlist.length;
		var aux = [];
		for(var i=0; i<len;i++) {
			var track = playlist[i];
			if(tid == track.id) continue;
			aux.push(track);
		}
		app.playlist = aux;		
		try { window.localStorage.setItem("playlist", JSON.stringify(app.playlist)); }catch(e){}

		app.showPlaylist();
	}

	this.openFromPlaylist = function(trackInfo) {
	
		var track = {
			id    : trackInfo.getAttribute("track-id"),
			name  : trackInfo.getAttribute("track-name"),
			star  : trackInfo.getAttribute("track-star"),
			time  : trackInfo.getAttribute("track-time"),
			album : trackInfo.getAttribute("track-album-title"),
			cover : trackInfo.getAttribute("track-album-cover"),
			user  : trackInfo.getAttribute("track-user"),
		}	
		app.open(track);
	}

	this.showSearch = function() {
		
		window.scrollTo(0,0)
		$(".container").hide();
		$("#search_container").show();
		
		$("#q").trigger("focus");
		cordova.exec(null, null, "KeyboardPlugin", "show",[]);
	}

	this.search = function(q) {
	
		$(".container").hide();
		$("#search_container").show();

		app.view.pushHistory("app.search('"+q+"')");
		$("#q").val(q);

		var page = document.getElementById("page").value;
			page = page == undefined || isNaN(page) || page == 0 ? 1 : page;

		this.publicRequest("/searchParser.php?q="+q+"&page="+page, function(data){
			
			var len = data.albums.length;
			if(!len) {
				$("#search-list").html('<li class="empty-list">No se han encontrado resultados! A afinar la punteria!</li>');
				return;
			}
			var albums = data.albums;
			var html = "<ul>";
			for(var i=0; i<len;i++) {
				var album =albums[i];
				var aux = [
					'<li class="album-item" onclick="app.loadAlbum(\''+album.href+'\')">',
					'	<img class="cover" src="'+album.cover+'" />',
					'	<p>',
					'		<span class="title">'+album.title+'</span>',
					'		<span class="auto">'+album.autor+'</span>',
					'   </p>',
					"</li>"
				].join("");
				html += aux;
			}
			html += "</ul>"
			$("#search-list").html(html);	
		});
	}	

	this.loadAlbum = function(ref) {
	
		$(".container").hide();
		app.view.pushHistory("app.loadAlbum('"+ref+"')");

		$("#album_container").show();
		
		this.publicRequest("/albumParser.php?album="+ref, function(data){
			
			$("#album-cover").attr("src",data.cover);
			$("#album-title").text(data.title);
			$("#album-user").text("@"+data.user.name);

			var tracks = data.tracks;
			var len = tracks.length;
			var html = "";
			for(var i=0; i<len;i++) {
				var track = tracks[i];
				var aclass = track.star ? "active" : "inactive";

				var trackInfo = [
					'track-id="'+track.id+'"',
					'track-name="'+track.name+'"',
					'track-star="'+track.star+'"',
					'track-time="'+track.time+'"',
					'track-album-title="'+data.title+'"',
					'track-album-cover="'+data.cover+'"',
					'track-user-="'+data.user.name+'"',
				].join(" ");

				var aux = [
					'<li class="track-item">',
					'	<button class="play" '+ trackInfo +' onclick="app.addToPlaylist(this)"></button>',
					'	<p class="time"> '+track.time+'</p>',
					'	<p class="star '+aclass+'"></p>',
					'	<p class="name">'+(i+1)+'. '+track.name+'</p>',
					'</li>'
				].join("");
				html += aux;
			}
			$("#album-track-list").html(html);
		});			
	}

	this.isOnPlaylist = function(track) {
		var tracks = app.playlist;
		var len = tracks.length;
		for(var i=0;i<len;i++) {
			var _track = tracks[i];
			if(_track.id == track.id) {
				return true;
			}
		}
		return false;
	}

	this.addToPlaylist = function(trackInfo) {
		
		var track = {
			id    : trackInfo.getAttribute("track-id"),
			name  : trackInfo.getAttribute("track-name"),
			star  : trackInfo.getAttribute("track-star"),
			time  : trackInfo.getAttribute("track-time"),
			album : trackInfo.getAttribute("track-album-title"),
			cover : trackInfo.getAttribute("track-album-cover"),
			user  : trackInfo.getAttribute("track-user"),
		}	
		
		if(!app.isOnPlaylist(track)) {
			app.playlist.push(track);
			alert("Cancion agregada a la lista de reproduccion");
			try { window.localStorage.setItem("playlist", JSON.stringify(app.playlist)); }catch(e) {}
		}	

		try{ 
			cordova.exec(function(data){
				if(!data.isPlaying) {
					app.open(track);
				}
			}, null, "MediaPlayerPlugin", "isplaying",[]);
		}catch(e) {	}

	}

	
	this.repeat  = function() {
		app.options.repeat = $("#repeatBtt").hasClass("repeat_active") ? false : true;
		app.prepareOptions();
		try { window.localStorage.setItem("options", JSON.stringify(app.options)); }catch(e){}
	}

	this.next = function() {
		
		var playlist = app.playlist;
		var len = playlist.length;
		if(!len) {
			alert("No hay temas en la lista de reproduccion");
			return;
		}
		var current = app.current;
		var pos = null;
		for(var i=0;i<len;i++){
			var track = playlist[i];
			if(track.id == current.id) {
				var pos = i;
			}
		}
		if(pos == null) return;
		if(pos < len-1) {
			var next = playlist[pos+1];
			app.open(next);
		}else{
			if(app.repeat) {
				var next = playlist[0];
				app.open(next);
			}
		}
	}

	this.prev = function() {
	
		var playlist = app.playlist;
		var len = playlist.length;
		if(!len) {
			alert("No hay temas en la lista de reproduccion");
			return;
		}
		var current = app.current;
		var pos = null;
		for(var i=0;i<len;i++){
			var track = playlist[i];
			if(track.id == current.id) {
				var pos = i;
			}
		}
		if(pos == null) return;
		if(pos>0) {
			// agregar repeat
			var prev = playlist[pos-1];
			app.open(prev);
		}
	}

	this.intervalID = null;
	this.open = function(track) {
		
		app.current = track;

		$("#playBtt").removeClass("play");
		$("#playBtt").addClass("pause");
		
		$("#playBtt").unbind("click");
		$("#playBtt").click(function(){
			app.pause();
		});

		$("#nowplaying-cover").attr("src",track.cover);
		$("#nowplaying-time").find(".position").text("00:00");
		$("#nowplaying-time").find(".total").text(track.time);
		$("#nowplaying-title").text(track.name);

		this.publicRequest("/requestStreaming.php?tid="+track.id, function(data){
			
			try{ 
				cordova.exec(function() {
					// on complete
					app.next();
				}, null, "MediaPlayerPlugin", "open",[data.url]);				

				if(app.intervalID == null) {
					app.intervalID = window.setInterval("app.getCurrentPosition()",500);
				}

				try { window.plugins.statusBarNotification.notify(track.name, track.album, "play"); }catch(e) { alert(e); }

			}catch(e) {
				
				$("#playBtt").removeClass("pause");
				$("#playBtt").addClass("play");

				$("#playBtt").unbind("click");
				$("#playBtt").click(function(){
					app.play();
				});
				alert("Ha ocurrido un error al intentar reproducir la cancion!");
			}
		});
	}

	this.getCurrentPosition = function() {
		try {
		cordova.exec(function(data) {
			$("#nowplaying-time").find(".position").text(data.currentPosition);
		}, null, "MediaPlayerPlugin", "getCurrentTimePosition",[]);
		}catch(e) {
			window.clearInterval(app.intervalID);
		}
	}

	this.pause = function() {
		
		$("#playBtt").removeClass("pause");
		$("#playBtt").addClass("play");

		$("#playBtt").unbind("click");
		$("#playBtt").click(function(){
			app.play();
		});
		
		try{ 
			cordova.exec(null, null, "MediaPlayerPlugin", "pause",[]);
			try { window.plugins.statusBarNotification.notify(app.current.name, app.current.album, "pause"); }catch(e) { }

		}catch(e) {
			$("#playBtt").removeClass("pause");
			$("#playBtt").addClass("play");

			$("#playBtt").unbind("click");
			$("#playBtt").click(function(){
				app.play();
			});
			alert("Ha ocurrido un error al intentar pausar la cancion!");
			cordova.exec(null, null, "MediaPlayerPlugin", "reset",[]);
		}
	}

	this.play = function() {
		
		$("#playBtt").removeClass("play");
		$("#playBtt").addClass("pause");

		$("#playBtt").unbind("click");
		$("#playBtt").click(function(){
			app.pause();
		});
		
		try{ 
			cordova.exec(null, null, "MediaPlayerPlugin", "play",[]);
			if(app.current != null) {
				try { window.plugins.statusBarNotification.notify(app.current.name, app.current.album, "play"); }catch(e) { }
			}

		}catch(e) {
			$("#playBtt").removeClass("pause");
			$("#playBtt").addClass("play");

			$("#playBtt").unbind("click");
			$("#playBtt").click(function(){
				app.play();
			});
			alert("Ha ocurrido un error al intentar pausar la cancion!");
			cordova.exec(null, null, "MediaPlayerPlugin", "reset",[]);
		}
	}

	this.hideApp = function() {
		cordova.exec(null, null, "TaskPlugin", "hideApp",[]);
	}
}


try { var app  = new _app(); }catch(e){ alert("Wops! Taringa! Se prendio fuego! Ayer andaba!"); }


function onLoad() {	
	document.addEventListener("deviceready", onDeviceReady, true);
}

function onDeviceReady() { 

	try { navigator.splashscreen.show(); }catch(e){ }
	// set correct style	
	try {  applyCorrectStyles(); } catch(e) { }

	// clear breadcrumb history
	// app.view.clearHistory();

	// overide menu button functionality
	document.addEventListener("menubutton", function () { }, false); 

	// override back button functionality
    try { device.overrideBackButton(); }catch(e) {};

	document.addEventListener("backbutton", function () {
        app.view.back();
    }, false);

	document.addEventListener("searchbutton",function(){
		app.showSearch();
	});
	
	document.addEventListener("resume",function(){
		if(app.view.breadcrumb.length == 1) {
			app.view.pushHistory("app.showPlaylist()");
		}			
	});
	
	var q = document.getElementById("q");
		q.addEventListener("focus", function(e){
			e.target.style.width = "150px";
			e.target.style.color = "#000";
			if(e.target.value == "Buscar") {
				e.target.value = "";
			}
		});
		q.addEventListener("focusout", function(e){
			e.target.style.width = "80px";
			e.target.style.color = "#aaa";
		});
		q.addEventListener("keypress", function(e){
			var charCode = (e.which) ? e.which : e.keyCode;
			if(charCode == 13) {
				var q = document.getElementById("q").value;
				app.search(q);
			}
		});

	// get playlist saved
	try {
		var playlist = window.localStorage.getItem("playlist");
		if(playlist == null) {
			app.playlist = [];
		}else {
			playlist = JSON.parse(playlist);
			app.playlist = playlist;
		}
	}catch(e) {
		app.playlist = [];
	}
	// get player options
	try {
		var options = window.localStorage.getItem("options");
		if(options != null) {
			options = JSON.parse(options);
			app.options.repeat = options.repeat != null || options.repeat ? true : false;
			app.options.shuffle = options.shuffle != null || options.shuffle ? true : false;
		}
	}catch(e) {}
	app.prepareOptions();

	setTimeout('$("#splash").hide(); $("#wrapper").show(); app.showPlaylist();',"1500");
}

function alert(msg) {
	try { cordova.exec( null, null, "ToastPlugin", "alert", [{"text":msg, "duration": "long"}] ); }catch(e) { console.log(e); }
}
