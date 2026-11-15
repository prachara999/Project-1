<?php
/** Score persistence. Demo scores are client-reported and are NOT cheat-proof. */
require __DIR__.'/common.php';
$key=me();
if ($_SERVER['REQUEST_METHOD']==='GET') {
    $p=storage(fn($all)=>$all[$key]??null);
    reply(['player'=>publicPlayer($p)]);
}
csrf(); $data=request();
$level=filter_var($data['level']??null,FILTER_VALIDATE_INT);
$score=filter_var($data['score']??null,FILTER_VALIDATE_INT);
$fish=filter_var($data['fish']??null,FILTER_VALIDATE_INT);
$completed=($data['completed']??false)===true;
if (!in_array($level,[1,2],true) || $score===false || $fish===false || $score<0 || $score>100000 || $fish<0 || $fish>1000) reply(['error'=>'Invalid game result'],422);
$result=storage(function($all)use($key,$level,$score,$fish,$completed){
    $p=$all[$key];
    if ($level>$p['levelUnlocked']) return ['error'=>'Level is locked'];
    $p['bestScore']=max($p['bestScore'],$score);
    // Completing Level 1 allows a live API challenge, but does not unlock Level 2.
    if ($completed && $level===1) $_SESSION['challengeEligible']=true;
    $p['history'][]=['level'=>$level,'score'=>$score,'fish'=>$fish,'completed'=>$completed,'date'=>gmdate('c')];
    $p['history']=array_slice($p['history'],-30);
    $all[$key]=$p;
    return ['players'=>$all,'value'=>['ok'=>true,'player'=>publicPlayer($p)]];
});
reply($result,isset($result['error'])?403:200);
