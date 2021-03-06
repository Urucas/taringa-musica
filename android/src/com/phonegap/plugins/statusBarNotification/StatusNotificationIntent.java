// This class is used on all Androids below Honeycomb
package com.phonegap.plugins.statusBarNotification;


import android.app.Notification;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;

import com.urucas.tmusica.R;

public class StatusNotificationIntent {
    public static Notification buildNotification( Context context, CharSequence tag, CharSequence contentTitle, CharSequence contentText, String iconID, int flag ) {
        
    	int icon = StatusNotificationIntent.getNotificationIcon(iconID);
        long when = System.currentTimeMillis();
        
        Notification noti = new Notification(icon, contentTitle, when);
        noti.flags |= Notification.FLAG_FOREGROUND_SERVICE;

        PackageManager pm = context.getPackageManager();
        Intent notificationIntent = pm.getLaunchIntentForPackage(context.getPackageName());
        notificationIntent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        notificationIntent.putExtra("notificationTag", tag);

        PendingIntent contentIntent = PendingIntent.getActivity(context, 0, notificationIntent, 0);
        noti.setLatestEventInfo(context, contentTitle, contentText, contentIntent);
        return noti;
    }
    
    private static int getNotificationIcon(String iconID) {
    	
    	if(iconID.equals("pause")) {
    		return R.drawable.pause;
    	}
    	return R.drawable.play;
    }
}
