<?php
/**
 * Shared server helpers. Keeping HTTP, sessions and storage here avoids repeating code.
 * AI assistance disclosure: OpenAI ChatGPT helped generate and document this project (2026).
 */
declare(strict_types=1);
ini_set('display_errors', '0');
session_set_cookie_params(['httponly'=>true, 'samesite'=>'Lax', 'secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off']);
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function reply(array $body, int $status=200): void { http_response_code($status); echo json_encode($body, JSON_UNESCAPED_SLASHES); exit; }
function request(): array { $input=json_decode(file_get_contents('php://input'),true); return is_array($input)?$input:[]; }
function storage(callable $callback): mixed {
    $path=__DIR__.'/../data/players.json';
    $fp=fopen($path,'c+');
    if (!$fp || !flock($fp,LOCK_EX)) reply(['error'=>'Storage unavailable'],500);
    $raw=stream_get_contents($fp);
    $players=json_decode($raw?:'{}',true);
    if (!is_array($players)) $players=[];
    $result=$callback($players);
    if (is_array($result) && array_key_exists('players',$result)) {
        rewind($fp); ftruncate($fp,0); fwrite($fp,json_encode($result['players'],JSON_PRETTY_PRINT)); fflush($fp);
        $value=$result['value'];
    } else { $value=$result; }
    flock($fp,LOCK_UN); fclose($fp); return $value;
}
function me(): string { if (empty($_SESSION['player'])) reply(['error'=>'Please sign in first'],401); return (string)$_SESSION['player']; }
function publicPlayer(array $p): array { return ['username'=>$p['username'],'avatar'=>$p['avatar'],'bestScore'=>$p['bestScore'],'levelUnlocked'=>$p['levelUnlocked'],'history'=>array_slice($p['history'],-10)]; }
function csrf(): void { if (!hash_equals($_SESSION['csrf']??'',(string)($_SERVER['HTTP_X_CSRF_TOKEN']??''))) reply(['error'=>'Invalid session token; reload the page'],403); }
