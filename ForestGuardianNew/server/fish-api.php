<?php
/** Fish Game API adapter: remote JSON over HTTPS; answer kept on server, not in browser. */
require __DIR__.'/common.php';
me();
if (empty($_SESSION['challengeEligible'])) reply(['error'=>'Complete Level 1 before starting the API challenge'],403);
if (($_GET['action']??'')==='answer') {
    if ($_SERVER['REQUEST_METHOD']!=='POST') reply(['error'=>'POST required'],405);
    csrf(); $data=request();
    if (!isset($_SESSION['challenge'])) reply(['error'=>'Load a challenge first'],409);
    $fish=filter_var($data['fish']??null,FILTER_VALIDATE_INT);
    $chest=filter_var($data['chest']??null,FILTER_VALIDATE_INT);
    if ($fish===false||$chest===false) reply(['error'=>'Enter both numbers'],422);
    $correct=$fish===$_SESSION['challenge']['fish'] && $chest===$_SESSION['challenge']['chest'];
    if ($correct) {
        unset($_SESSION['challenge'], $_SESSION['challengeEligible']);
        $key=me();
        storage(function($all)use($key){ $all[$key]['levelUnlocked']=max(2,$all[$key]['levelUnlocked']); return ['players'=>$all,'value'=>true]; });
    }
    reply(['correct'=>$correct,'message'=>$correct?'Excellent! Both answers are correct.':'Not quite. Study the picture and try again.']);
}
$url='https://marcconrad.com/uob/fish/api.php?out=json';
$raw=false;
if (function_exists('curl_init')) {
    $ch=curl_init($url); curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_TIMEOUT=>10,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_SSL_VERIFYPEER=>true]);
    $raw=curl_exec($ch); curl_close($ch);
} elseif (ini_get('allow_url_fopen')) {
    $raw=@file_get_contents($url,false,stream_context_create(['http'=>['timeout'=>10]]));
}
$data=$raw?json_decode($raw,true):null;
if (!is_array($data)||!isset($data['question'],$data['fish'],$data['chest'])||!filter_var($data['question'],FILTER_VALIDATE_URL)) reply(['error'=>'The live university Fish API is unavailable. Check your internet and retry.'],503);
if (parse_url($data['question'],PHP_URL_SCHEME)!=='https') reply(['error'=>'Invalid API image URL'],502);
$_SESSION['challenge']=['fish'=>(int)$data['fish'],'chest'=>(int)$data['chest']];
reply(['image'=>$data['question'],'source'=>'University Fish Game API','live'=>true]);
