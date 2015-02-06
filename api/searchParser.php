<?php 

	error_reporting(E_ERROR | E_PARSE);

	$q    = isset($_GET["q"]) ? trim($_GET["q"]) : "";
	$page = isset($_GET["page"]) ? (int) $_GET["page"] : 1;

	$list["q"] = $q;
	$list["page"] = $page;

	$url = "http://www.taringa.net/buscar/albums/?q=$q&p=$page";

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

	$nodes = $finder->query("//*[contains(concat(' ', normalize-space(@class), ' '), 'nav-pages')]");
	if($nodes->length) {	
		$node  = $nodes->item(0);
		$pes = $node->getElementsByTagName("li");

		$last_node = $pes->item($pes->length-1);
		if($last_node->hasAttribute("class") && $last_node->getAttribute("class")=="here") {
			$list["nextPage"] = false;
		}else {
			$list["nextPage"] = $page+1;			
		}

	}else{
		$list["nextPage"] = false;
	}

	$nodes = $finder->query("//*[contains(concat(' ', normalize-space(@class), ' '), 'result-post')]");
	if($nodes->length) {

	for($i =0; $i< $nodes->length; $i++) {

		$node = $nodes->item($i);

		$img = $node->getElementsByTagName("img");
		$img = $img->item(0);
		$album["cover"] = $img->getAttribute("src");

		$as = $node->getElementsByTagName("a");
		for($j=0; $j<$as->length;$j++) {

			$a = $as->item($j);
			if($a->hasAttribute("title")) {
				$album["title"] = $a->getAttribute("title");
				$album["href"]  = "http://www.taringa.net".$a->getAttribute("href");
			}
			else {
				if($a->hasAttribute("href") && $a->getAttribute("href") == "#"){
					$album["autor"] = $a->nodeValue;
				}
			}

		}
		$list["albums"][] = $album;
	}
	}else {
		$list["albums"] = array();
	}
	die(json_encode($list));

?>
