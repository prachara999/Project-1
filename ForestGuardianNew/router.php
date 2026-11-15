<?php
// Optional PHP built-in server router: prevents direct access to private data.
$path=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
if (str_starts_with($path,'/data/') || str_starts_with($path,'/docs/original_prototype/')) {
    http_response_code(403); exit('Forbidden');
}
return false;
