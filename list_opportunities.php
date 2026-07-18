<?php
// ============================================================
// Returns approved opportunities as JSON for the project panel.
// ============================================================

header('Content-Type: application/json');
require __DIR__ . '/db.php';

try {
    $stmt = $pdo->query(
        "SELECT id, title, category, company, description, registration_link,
                last_date, location, poster_path, posted_by, status, featured, created_at
         FROM opportunities
         WHERE status = 'Approved'
         ORDER BY featured DESC, last_date ASC"
    );

    echo json_encode(['success' => true, 'opportunities' => $stmt->fetchAll()]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Could not load opportunities.']);
}
