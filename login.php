<?php
// ============================================================
// Handles login by PRN + password. Starts a session on success.
// ============================================================

header('Content-Type: application/json');
require __DIR__ . '/db.php';
session_start();

function fail($message, $code = 401) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Invalid request method.', 405);
}

$prn      = trim($_POST['prn'] ?? '');
$password = $_POST['password'] ?? '';

if ($prn === '' || $password === '') {
    fail('Enter your PRN and password.', 400);
}

try {
    $stmt = $pdo->prepare('SELECT id, full_name, prn, password_hash, role FROM users WHERE prn = :prn');
    $stmt->execute([':prn' => $prn]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        fail('Incorrect PRN or password.');
    }

    $_SESSION['user_id']   = $user['id'];
    $_SESSION['full_name'] = $user['full_name'];
    $_SESSION['role']      = $user['role'];

    echo json_encode([
        'success' => true,
        'message' => 'Logged in successfully.',
        'user'    => [
            'name' => $user['full_name'],
            'role' => $user['role'],
        ],
    ]);

} catch (PDOException $e) {
    fail('Something went wrong. Please try again.', 500);
}
