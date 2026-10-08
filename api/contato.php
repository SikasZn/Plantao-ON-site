<?php
// Recebe o formulário do site e envia por e-mail para a caixa de contato.
// Funciona na hospedagem compartilhada da Hostinger (função mail() do PHP).
declare(strict_types=1);

const TO_EMAIL   = 'imthealthtech@imtmed.com.br';
const FROM_EMAIL = 'imthealthtech@imtmed.com.br'; // deve ser um e-mail do próprio domínio
const SITE_NAME  = 'Plantão ON';
const MAX_PER_HOUR = 5;                      // limite por IP

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function reply(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}
function clean(string $v, int $max): string {
    $v = trim(str_replace(["\r", "\0"], '', $v));
    return mb_substr($v, 0, $max);
}
function one_line(string $v): string {
    return trim(preg_replace('/[\r\n\t]+/', ' ', $v) ?? '');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reply(405, ['ok' => false, 'error' => 'Método não permitido.']);
}

// Honeypot: robôs preenchem; fingimos sucesso e descartamos
if (!empty($_POST['site'])) {
    reply(200, ['ok' => true]);
}

$nome     = one_line(clean((string)($_POST['nome'] ?? ''), 100));
$email    = one_line(clean((string)($_POST['email'] ?? ''), 150));
$assunto  = one_line(clean((string)($_POST['assunto'] ?? ''), 80));
$mensagem = clean((string)($_POST['mensagem'] ?? ''), 3000);

$assuntosValidos = [
    'Dúvida sobre o aplicativo', 'Suporte técnico', 'Assinatura e pagamento',
    'Privacidade e dados pessoais', 'Sugestão', 'Outro',
];

if ($nome === '' || $email === '' || $assunto === '' || mb_strlen($mensagem) < 5) {
    reply(422, ['ok' => false, 'error' => 'Preencha todos os campos para enviar.']);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    reply(422, ['ok' => false, 'error' => 'Informe um e-mail válido.']);
}
if (!in_array($assunto, $assuntosValidos, true)) {
    reply(422, ['ok' => false, 'error' => 'Assunto inválido.']);
}

// Limite simples por IP (arquivo temporário)
$ip   = $_SERVER['REMOTE_ADDR'] ?? 'x';
$file = sys_get_temp_dir() . '/plantaoon_rl_' . md5($ip) . '.json';
$now  = time();
$hits = [];
if (is_file($file)) {
    $hits = json_decode((string)@file_get_contents($file), true) ?: [];
    $hits = array_values(array_filter($hits, fn($t) => is_int($t) && $t > $now - 3600));
}
if (count($hits) >= MAX_PER_HOUR) {
    reply(429, ['ok' => false, 'error' => 'Muitas mensagens em pouco tempo. Tente novamente mais tarde.']);
}

$subject = '[' . SITE_NAME . '] ' . $assunto . ' — ' . $nome;
$body  = "Nova mensagem pelo site\r\n\r\n";
$body .= "Nome: $nome\r\nE-mail: $email\r\nAssunto: $assunto\r\n\r\n";
$body .= $mensagem . "\r\n\r\n--\r\nIP: $ip\r\nEnviado em: " . date('d/m/Y H:i:s') . "\r\n";

$headers = [
    'From: ' . SITE_NAME . ' <' . FROM_EMAIL . '>',
    'Reply-To: ' . str_replace(['"', '<', '>', ',', ';'], '', $nome) . ' <' . $email . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
];

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$sent = @mail(TO_EMAIL, $encodedSubject, $body, implode("\r\n", $headers), '-f' . FROM_EMAIL);

if (!$sent) {
    reply(500, ['ok' => false, 'error' => 'Não foi possível enviar agora. Escreva para ' . TO_EMAIL . '.']);
}

$hits[] = $now;
@file_put_contents($file, json_encode($hits), LOCK_EX);
reply(200, ['ok' => true]);
