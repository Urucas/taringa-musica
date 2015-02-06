<?php 

	error_reporting(E_ERROR | E_PARSE);

	$tid = $_GET["tid"];

	$ch = curl_init();
	$fields = array("trackId" => $tid);
	foreach($fields as $key=>$value) { $fields_string .= $key.'='.$value.'&'; }
	rtrim($fields_string, '&');

	//set the url, number of POST vars, POST data
	curl_setopt($ch,CURLOPT_URL, "http://www.taringa.net/music/request-token.php");
	curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch,CURLOPT_POST, count($fields));
	curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);

	//execute post
	$result = @curl_exec($ch);
		//close connection
	@curl_close($ch);

	die($result);
?>
