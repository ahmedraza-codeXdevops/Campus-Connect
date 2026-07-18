<?php
// ============================================================
// Handles student / faculty registration.
// Validates input, checks PRN uniqueness, hashes the password.
// ============================================================

header('Content-Type: application/json');
require __DIR__ . '/db.php';

function fail($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail('Invalid request method.', 405);
}

$fullName        = trim($_POST['full_name'] ?? '');
$prn              = trim($_POST['prn'] ?? '');
$password         = $_POST['password'] ?? '';
$confirmPassword  = $_POST['confirm_password'] ?? '';
$role             = trim($_POST['role'] ?? 'student');

$errors = [];

if ($fullName === '' || mb_strlen($fullName) > 100) $errors[] = 'Full name is required.';
if ($prn === '' || !preg_match('/^[A-Za-z0-9\-]{4,20}$/', $prn)) $errors[] = 'Enter a valid PRN.';
if (mb_strlen($password) < 8) $errors[] = 'Password must be at least 8 characters.';
if ($password !== $confirmPassword) $errors[] = 'Passwords do not match.';
if (!in_array($role, ['student', 'faculty'], true)) $errors[] = 'Choose a valid account type.';

if (!empty($errors)) {
    fail(implode(' ', $errors));
}

try {
    $check = $pdo->prepare('SELECT id FROM users WHERE prn = :prn');
    $check->execute([':prn' => $prn]);
    if ($check->fetch()) {
        fail('That PRN is already registered. Try logging in instead.');
    }

    $stmt = $pdo->prepare(
        'INSERT INTO users (full_name, prn, password_hash, role)
         VALUES (:full_name, :prn, :password_hash, :role)'
    );
    $stmt->execute([
        ':full_name'     => $fullName,
        ':prn'           => $prn,
        ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ':role'          => $role,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully.',
        'id'      => $pdo->lastInsertId(),
    ]);

} catch (PDOException $e) {
    fail('Could not create your account. Please try again.', 500);
}
