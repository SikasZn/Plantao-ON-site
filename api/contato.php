<?php
// Recebe o formulário do site e envia por e-mail para a caixa de contato.
// Funciona na hospedagem compartilhada da Hostinger (função mail() do PHP).
declare(strict_types=1);

const TO_EMAIL   = 'imthealthtech@imtmed.com.br';
const FROM_EMAIL = 'imthealthtech@imtmed.com.br'; // deve ser um e-mail do próprio domínio
const SITE_NAME  = 'Plantão ON';
const MAX_PER_HOUR = 10;                     // limite por IP

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
    reply(429, ['ok' => false, 'error' => 'Você já enviou várias mensagens em pouco tempo. Aguarde cerca de 1 hora ou escreva para ' . TO_EMAIL . '.']);
}

$subject = '[' . SITE_NAME . '] ' . $assunto . ' — ' . $nome;
$body  = "Nova mensagem pelo site\r\n\r\n";
$body .= "Nome: $nome\r\nE-mail: $email\r\nAssunto: $assunto\r\n\r\n";
$body .= $mensagem . "\r\n\r\n--\r\nIP: $ip\r\nEnviado em: " . date('d/m/Y H:i:s') . "\r\n";

// Configuração privada (chave do Resend), guardada FORA da pasta pública:
//   /home/uXXXX/plantaoon-config.php   (um nível acima de public_html)
$config = [];
// Procura plantaoon-config.php nas pastas ACIMA do site (até 3 níveis).
// Por segurança, ignora qualquer pasta chamada public_html (acessível pela web).
$dir = (string)($_SERVER['DOCUMENT_ROOT'] ?? '');
for ($i = 0; $i < 3 && $dir !== '' && $dir !== '/'; $i++) {
    $dir = dirname($dir);
    if (basename($dir) === 'public_html') { continue; }
    $candidate = $dir . '/plantaoon-config.php';
    if (is_file($candidate)) {
        $loaded = include $candidate;
        if (is_array($loaded)) { $config = $loaded; }
        break;
    }
}

function send_with_resend(array $config, string $subject, string $body, string $replyName, string $replyEmail): string {
    if (empty($config['resend_api_key'])) { return 'sem chave (arquivo plantaoon-config.php nao encontrado ou vazio)'; }
    if (!function_exists('curl_init'))   { return 'extensao curl indisponivel'; }
    $payload = [
        'from'     => $config['from'] ?? (SITE_NAME . ' <nao-responda@imtmed.com.br>'),
        'to'       => [TO_EMAIL],
        'reply_to' => $replyName . ' <' . $replyEmail . '>',
        'subject'  => $subject,
        'text'     => $body,
    ];
    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 15,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $config['resend_api_key'],
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
    ]);
    $resp  = curl_exec($ch);
    $code  = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $cerr  = curl_error($ch);
    curl_close($ch);
    if ($resp === false) { return 'falha de rede: ' . $cerr; }
    if ($code < 200 || $code >= 300) { return 'Resend HTTP ' . $code . ': ' . mb_substr((string)$resp, 0, 300); }
    return '';
}

$replyName = str_replace(['"', '<', '>', ',', ';'], '', $nome);
$resendError = send_with_resend($config, $subject, $body, $replyName, $email);
$sent = ($resendError === '');
$via  = 'Resend';

// Plano B: mail() do PHP (pode cair no spam se o domínio usa o Google para e-mail)
if (!$sent) {
    error_log('[contato.php] Resend falhou -> usando mail(): ' . $resendError);
    $via  = 'mail() do PHP [Resend falhou: ' . $resendError . ']';
    $body .= "Enviado via: $via\r\n";
    $headers = [
        'From: ' . SITE_NAME . ' <' . FROM_EMAIL . '>',
        'Reply-To: ' . $replyName . ' <' . $email . '>',
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'X-Mailer: PHP/' . PHP_VERSION,
    ];
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    $sent = @mail(TO_EMAIL, $encodedSubject, $body, implode("\r\n", $headers), '-f' . FROM_EMAIL);
}

if (!$sent) {
    reply(500, ['ok' => false, 'error' => 'Não foi possível enviar agora. Escreva para ' . TO_EMAIL . '.']);
}

$hits[] = $now;
@file_put_contents($file, json_encode($hits), LOCK_EX);
reply(200, ['ok' => true]);
