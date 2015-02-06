package com.urucas.plugins;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import android.content.Context;
import android.view.inputmethod.InputMethodManager;

public class TaskPlugin extends CordovaPlugin {

	@Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        
		if(action.equals("hideApp")) {			
			this.cordova.getActivity().moveTaskToBack(true);
			return true;
        }
        return false;
    }
}
