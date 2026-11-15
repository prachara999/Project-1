<?php
/** Player identity: password hashing, HTTP-only session cookies and CSRF protection. */
require __DIR__.'/common.php';
$action=$_GET['action']??'';
if ($action==='me') {
    if (empty($_SESSION['player'])) reply(['loggedIn'=>false]);
    $name=me(); $p=storage(fn($all)=>$all[$name]??null);
    if (!$p) reply(['loggedIn'=>false]);
    reply(['loggedIn'=>true,'player'=>publicPlayer($p),'csrf'=>$_SESSION['csrf']??'']);
}
if ($_SERVER['REQUEST_METHOD']!=='POST') reply(['error'=>'POST required'],405);
$input=request();
if ($action==='logout') { csrf(); $_SESSION=[]; session_destroy(); reply(['ok'=>true]); }
$username=trim((string)($input['username']??'')); $password=(string)($input['password']??'');
if (!preg_match('/^[A-Za-z0-9_]{3,20}$/',$username)) reply(['error'=>'Username must be 3–20 letters, numbers or underscores'],422);
if (strlen($password)<6 || strlen($password)>128) reply(['error'=>'Password must be 6–128 characters'],422);
$key=strtolower($username);
if ($action==='register') {
    $avatar=in_array($input['avatar']??'', ['fox','deer','owl','bear'],true)?$input['avatar']:'fox';
    $result=storage(function($all)use($key,$username,$password,$avatar){
        if (isset($all[$key])) return ['error'=>'Username already exists'];
        $all[$key]=['username'=>$username,'passwordHash'=>password_hash($password,PASSWORD_DEFAULT),'avatar'=>$avatar,'bestScore'=>0,'levelUnlocked'=>1,'history'=>[]];
        return ['players'=>$all,'value'=>['ok'=>true]];
    });
} elseif ($action==='login') {
    $result=storage(function($all)use($key,$password){
        return isset($all[$key]) && password_verify($password,$all[$key]['passwordHash']) ? ['ok'=>true] : ['error'=>'Invalid username or password'];
    });
} else reply(['error'=>'Unknown action'],404);
if (isset($result['error'])) reply($result, $action==='register'?409:401);
session_regenerate_id(true); $_SESSION['player']=$key; $_SESSION['csrf']=bin2hex(random_bytes(16));
$p=storage(fn($all)=>$all[$key]);
reply(['ok'=>true,'player'=>publicPlayer($p),'csrf'=>$_SESSION['csrf']]);
