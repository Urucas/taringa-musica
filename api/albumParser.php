<?php 

	error_reporting(E_ERROR | E_PARSE);

	$url = trim($_GET["album"]);
	if($url == "") {
		die(json_encode(array("error"=>"album url not found")));
	}
//	$url = "http://www.taringa.net/musica/2329-Daft-8Bit_s-_MoSk-vs-Da-Chip_/";

	$ch = curl_init();

	//set the url, number of POST vars, POST data
	curl_setopt($ch,CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

	//execute post
	$result = @curl_exec($ch);
		//close connection
	@curl_close($ch);


	$dom = new DomDocument();
	$dom->loadHTML($result);

	$finder = new DomXPath($dom);


	$profile = $dom->getElementById("ProfileMusicPlayer");
	
	$album   = $profile->getElementsByTagName("h2");
	$album   = $album->item(0);
	$songs["title"] = $album->nodeValue;

	$nodes = $finder->query("//*[contains(concat(' ', normalize-space(@class), ' '), 'albumImage')]");
	$node = $nodes->item(0);
	
	$img  = $node->getElementsByTagName("img");
	$img  = $img->item(0);
	$songs["cover"] = $img->getAttribute("src");

	$nodes = $finder->query("//*[contains(concat(' ', normalize-space(@class), ' '), 'profile-m')]");
	$node = $nodes->item(0);

	$user = $node->getElementsByTagName("a");
	$user = $user->item(0);
	$songs["user"]["name"] = str_replace("/","", $user->getAttribute("href"));

	$user = $user->getElementsByTagName("img");
	$user = $user->item(0);
	$songs["user"]["avatar"] = $user->getAttribute("src");


	$nodes = $finder->query("//*[contains(concat(' ', normalize-space(@class), ' '), 'song-list')]");
	$node = $nodes->item(0);

	$tracks = $node->getElementsByTagName("tr");

	for($i=0; $i < $tracks->length;$i++) {

		$track = $tracks->item($i);
		if($track == null) continue;
		if($track->getAttribute("itemprop") == null) continue;

		$tds = $track->getElementsByTagName("td");

		for($j=0; $j < $tds->length; $j++) {

			$td = $tds->item($j);
			if($td->getAttribute("class") == "play") {
				
				$a = $td->getElementsByTagName("a");
				$a = $a->item(0);
				$song["id"] = $a->getAttribute("data-play");	
			
			}

			if($td->getAttribute("class") == "name") {

				$s = $td->getElementsByTagName("span");
				$s = $s->item(0);

				$song["name"] = $s->nodeValue;
			}

			if($td->getAttribute("class") == "time") {
				$song["time"] = $td->nodeValue;
			}

			if($td->getAttribute("class") == "star") {
				$song["star"] = $td->hasChildNodes() ? 1 : 0;
			}
//			var_dump($song);
		}
		$songs["tracks"][] = $song;		
	}

	die(json_encode($songs));


?>
