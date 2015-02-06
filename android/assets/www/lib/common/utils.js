function _container(path, parent, id, callback) {

	if(path == undefined || parent == undefined) return;	
	var par = document.getElementById(parent); 
	var elm = document.createElement('div');
		elm.id = id;
		elm.style.display = 'none';

	par.appendChild(elm);
	$('#' + elm.id).load(
		'lib/views/' + path, 
		'',
		function() {	
			$("#" + id).append('<div style="clear:both;"></div>');
			callback();
		}
	);
}

function _history() {
	this.breadcrumb = [];
	
	}

function _view() {		
	
	this.current_view = null;	
	this.breadcrumb   = ["app.hideApp()"];

	this.show = function(view_id) {
		if(this.current_view != null) {
			$('#' + this.current_view).hide();
		}
		this.current_view = view_id;
		
		/*
		var breadcrumb = this.breadcrumb;
		var len        = breadcrumb.length;
		var last_view  = breadcrumb[len - 1];
		if(last_view != view_id) {
			this.breadcrumb.push(view_id);	
		}		
		*/
		scroll(0,0);
		$('#' + view_id).show();
		
	}

	this.pushHistory  = function(funcAsString) {

		if(funcAsString.trim() == "") {
			return;
		}
		var breadcrumb = this.breadcrumb;
		var len = breadcrumb.length;
		if(len > 0) {
			var prev = breadcrumb[len-1];
			if(prev == funcAsString) {
				return;
			}
		}
		this.breadcrumb.push(funcAsString);
	}

	this.deleteHistoryStep = function() {

		var breadcrumb = this.breadcrumb;
			breadcrumb.pop();

		if(breadcrumb.length <= 1) {
			this.clearHistory();
			return;
		}
		/*
		breadcrumb.pop();
		if(breadcrumb.length <= 1) {
			this.clearHistory();
			return;
		}
		*/
		this.breadcrumb = breadcrumb;
	}

	this.back = function() {

    	var breadcrumb = this.breadcrumb;

        var current = breadcrumb.pop();
        if(breadcrumb.length > 0) {
            var previous = breadcrumb.pop();
        } else {
            var previous = current;
        }
        this.breadcrumb = breadcrumb;

		try { eval(previous); }catch(e) { }

		if(breadcrumb.length == 0) {
			this.clearHistory();
		}

	}

 	this.clearHistory = function() {
        this.breadcrumb  = ["app.hideApp()"];
    }

	/*
	this.preloader = function() {
		$('#preloader').show();
	}
	*/
}
/**
 * @param {Object} str
 * 
 */

String.prototype.trim = function() {
	return this.replace(/^\s+/g,'').replace(/\s+$/g,'');
}

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}

