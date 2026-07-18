<?php
// ============================================================
// Handles a new opportunity submission from the Post Section.
// Validates input, stores an optional attachment, and inserts
// the row with status = 'Pending' so it awaits admin approval.
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

// ---------- Collect + trim fields ----------
$title       = trim($_POST['title'] ?? '');
$category    = trim($_POST['category'] ?? '');
$company     = trim($_POST['company'] ?? '');
$description = trim($_POST['description'] ?? '');
$regLink     = trim($_POST['registration_link'] ?? '');
$lastDate    = trim($_POST['last_date'] ?? '');
$location    = trim($_POST['location'] ?? 'Online');
$postedBy    = trim($_POST['posted_by'] ?? '');
$postedRole  = trim($_POST['posted_by_role'] ?? 'student');

$allowedCategories = ['Internship','Hackathon','Coding Competition','Workshop','Webinar','Certification','Placement Drive','Campus Event'];
$allowedLocations  = ['Online','Offline'];
$allowedRoles      = ['student','faculty','admin'];

// ---------- Validate ----------
$errors = [];

if ($title === '' || mb_strlen($title) > 150)              $errors[] = 'Title is required and must be under 150 characters.';
if (!in_array($category, $allowedCategories, true))        $errors[] = 'Please choose a valid category.';
if ($company === '' || mb_strlen($company) > 150)          $errors[] = 'Company or organization is required.';
if ($description === '' || mb_strlen($description) > 600)  $errors[] = 'Description is required and must be under 600 characters.';
if (!filter_var($regLink, FILTER_VALIDATE_URL))             $errors[] = 'Registration link must be a valid URL.';
if (!in_array($location, $allowedLocations, true))          $errors[] = 'Location must be Online or Offline.';
if ($postedBy === '' || mb_strlen($postedBy) > 100)         $errors[] = 'Your name is required.';
if (!in_array($postedRole, $allowedRoles, true))             $postedRole = 'student';

$dateObj = DateTime::createFromFormat('Y-m-d', $lastDate);
if (!$dateObj) {
    $errors[] = 'Last date to apply must be a valid date.';
}

if (!empty($errors)) {
    fail(implode(' ', $errors));
}

// ---------- Handle optional attachment ----------
$posterPath = null;

if (isset($_FILES['poster']) && $_FILES['poster']['error'] !== UPLOAD_ERR_NO_FILE) {

    if ($_FILES['poster']['error'] !== UPLOAD_ERR_OK) {
        fail('The attachment failed to upload. Please try again.');
    }

    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    $maxBytes     = 5 * 1024 * 1024; // 5 MB

    $finfo    = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $_FILES['poster']['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes, true)) {
        fail('Attachment must be a JPG, PNG, WEBP, or PDF file.');
    }
    if ($_FILES['poster']['size'] > $maxBytes) {
        fail('Attachment must be smaller than 5 MB.');
    }

    $uploadDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $ext      = pathinfo($_FILES['poster']['name'], PATHINFO_EXTENSION);
    $safeName = bin2hex(random_bytes(8)) . '.' . strtolower($ext);

    if (!move_uploaded_file($_FILES['poster']['tmp_name'], $uploadDir . $safeName)) {
        fail('Could not save the attachment. Please try again.');
    }

    $posterPath = 'uploads/' . $safeName;
}

// ---------- Insert ----------
try {
    $stmt = $pdo->prepare(
        'INSERT INTO opportunities
            (title, category, company, description, registration_link, last_date, location, poster_path, posted_by, posted_by_role, status)
         VALUES
            (:title, :category, :company, :description, :registration_link, :last_date, :location, :poster_path, :posted_by, :posted_by_role, "Pending")'
    );

    $stmt->execute([
        ':title'              => $title,
        ':category'           => $category,
        ':company'            => $company,
        ':description'        => $description,
        ':registration_link'  => $regLink,
        ':last_date'          => $dateObj->format('Y-m-d'),
        ':location'           => $location,
        ':poster_path'        => $posterPath,
        ':posted_by'          => $postedBy,
        ':posted_by_role'     => $postedRole,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Your opportunity was submitted and is pending approval.',
        'id'      => $pdo->lastInsertId(),
    ]);

} catch (PDOException $e) {
    fail('Could not save your submission. Please try again.', 500);
}
