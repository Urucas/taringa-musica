package com.urucas.plugins;

import java.io.IOException;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaInterface;
import org.apache.cordova.api.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.inputmethod.InputMethodManager;
import android.webkit.WebView;
import android.widget.Toast;

public class MediaPlayerPlugin extends CordovaPlugin {

	MediaPlayer mediaPlayer;
			
	@Override
	public void initialize(CordovaInterface cordova ,CordovaWebView cdv) {
		
		super.initialize(cordova, cdv);
		
		mediaPlayer = new MediaPlayer();
		mediaPlayer.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {				
			@Override
			public void onPrepared(MediaPlayer mp) {
				// TODO Auto-generated method stub	
				
				mp.start();
			}
		});
		
		final Context context = this.cordova.getActivity();
		mediaPlayer.setOnErrorListener(new MediaPlayer.OnErrorListener() {
			
			@Override
			public boolean onError(MediaPlayer mp, int what, int extra) {
				// TODO Auto-generated method stub
				String error_message = "Ha ocurrido un error con el reproductor!";
				if(what == mp.MEDIA_ERROR_SERVER_DIED) {
					error_message = "Se ha cortado la conexion a datos!";
				}
				Toast toast = Toast.makeText(context, error_message , Toast.LENGTH_LONG);
				toast.show();
				return false;
			}
		});	
		
		mediaPlayer.setOnBufferingUpdateListener(new MediaPlayer.OnBufferingUpdateListener() {

			@Override
			public void onBufferingUpdate(MediaPlayer mp, int percent) {
				// TODO Auto-generated method stub
				if(percent < 100) {
					// Toast toast = Toast.makeText(context, "Buffering... "+percent+"%", Toast.LENGTH_SHORT);
					// toast.show();						
				}			    	
			}
		});		
		
		ListenToPhoneState listener = new ListenToPhoneState(this);
        TelephonyManager tManager = (TelephonyManager) this.cordova.getActivity().getSystemService(Context.TELEPHONY_SERVICE);
        if(tManager != null) tManager.listen(listener, PhoneStateListener.LISTEN_CALL_STATE);

	}
	
	
	@Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
			
		if(action.equals("play")) {			
        	this.play(callbackContext);
        	return true;
        } else if(action.equals("pause")) {
        	this.pause(callbackContext);
        	return true;
        } else if(action.equals("open")) {
        	String url = args.getString(0);
        	this.open(url, callbackContext);
        	return true;
        } else if(action.equals("isplaying")) {
        	this.isplaying(callbackContext);
        	return true;
        } else if(action.equals("reset")) {
        	this.reset(callbackContext);
        	return true;
        }else if(action.equals("getCurrentTimePosition")) {
        	this.getCurrentTimePosition(callbackContext);
        	return true;
        }
		return false;
	}
	
	private void isplaying(CallbackContext callbackContext) {
		JSONObject response = new JSONObject();
		try {
			response.put("isPlaying", mediaPlayer.isPlaying());
		} catch (JSONException e) {
			callbackContext.error("error trying to get mediaplayer is playing state");
		}					
		callbackContext.success(response);
	}
	
	private void open(String url, CallbackContext callbackContext) {
				
		Uri uri = Uri.parse(url);
		try {
			if(mediaPlayer.isPlaying()) {
				mediaPlayer.stop();				
			}
			mediaPlayer.reset();	
			mediaPlayer.setDataSource(this.cordova.getActivity().getApplicationContext(), uri);
			mediaPlayer.prepareAsync(); // might take long! (for buffering, etc)
			// mediaPlayer.start();
						
			final CallbackContext aux = callbackContext;			
			mediaPlayer.setOnCompletionListener(new MediaPlayer.OnCompletionListener() {
				@Override
				public void onCompletion(MediaPlayer mp) {
					// TODO Auto-generated method stub					
					aux.success();
				}
			});						
					
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			callbackContext.error(e.toString());
		} 
				
	}
	
	private void getCurrentTimePosition(CallbackContext callbackContext) {
		
		String finalTimerString = "";
        String secondsString = "";
 
        long milliseconds = mediaPlayer.getCurrentPosition();
        // Convert total duration into time
        int minutes = (int)(milliseconds % (1000*60*60)) / (1000*60);
        int seconds = (int) ((milliseconds % (1000*60*60)) % (1000*60) / 1000);
        
        // Prepending 0 to seconds if it is one digit
        if(seconds < 10){
        	secondsString = "0" + seconds;
        }else{
           secondsString = "" + seconds;}
 
        finalTimerString = finalTimerString + minutes + ":" + secondsString;
           
        JSONObject response = new JSONObject();
		try {
			response.put("currentPosition", finalTimerString);
		} catch (JSONException e) {
			callbackContext.error("error trying to get mediaplayer current position");
		}
		callbackContext.success(response);
    }
		
	private void play(CallbackContext callbackContext) {
		if(!mediaPlayer.isPlaying()) {
			mediaPlayer.start();			
		}		
	}
		
	private void pause(CallbackContext callbackContext) {
		if(mediaPlayer.isPlaying()) {
			mediaPlayer.pause();
		}	
	}
	
	private void reset(CallbackContext callbackContext) {
		mediaPlayer.reset();
	}	
	
	public void next() {
		this.webView.sendJavascript("app.next()");
	}
	
	//Makes sure the audio is paused for incoming/outgoing phone calls
	public class ListenToPhoneState extends PhoneStateListener {

	    private boolean pausedForPhoneCall = false;
	    private MediaPlayerPlugin mplayer;

	    ListenToPhoneState(MediaPlayerPlugin mp){
	        mplayer = mp;
	    }

	    @Override
	    public void onCallStateChanged(int state, String incomingNumber) {
	    	
	    	switch (state) {
	            case TelephonyManager.CALL_STATE_IDLE:
	                resumeInAndroid();
	                return;
	            case TelephonyManager.CALL_STATE_OFFHOOK: 
	                pauseInAndroid();               
	                return;
	            case TelephonyManager.CALL_STATE_RINGING: 
	                pauseInAndroid();               
	                return;
	        }
	    }

	    private void resumeInAndroid(){
	        if(pausedForPhoneCall == true) {
	            pausedForPhoneCall=false;
	            mplayer.play(null);
	        }
	    }

	    private void pauseInAndroid(){
	        if(pausedForPhoneCall == false){
	            pausedForPhoneCall=true;
	            mplayer.pause(null);
	        }
	    }

	    String stateName(int state) {
	        switch (state) {
	            case TelephonyManager.CALL_STATE_IDLE: return "Idle";
	            case TelephonyManager.CALL_STATE_OFFHOOK: return "Off hook";
	            case TelephonyManager.CALL_STATE_RINGING: return "Ringing";
	        }
	        return Integer.toString(state);
	    }
	}
	
}



