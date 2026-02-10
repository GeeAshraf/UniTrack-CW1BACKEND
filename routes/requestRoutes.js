const express = require('express');
const {
    RetrieveAllRequests,
    RetrieveRequestById,
    CreateRequest,
    AssignRequest,
    UpdateRequestById,
    UpdateStatus,
    DeleteRequestById
} = require('../controllers/requestController');

const protect = require('../middleware/projectRoute');
const restrictTo = require('../middleware/restrictTo');

const router = express.Router();
router.use(protect);

router.get('/', RetrieveAllRequests);
router.get('/:id', RetrieveRequestById);
router.post('/', CreateRequest);

// Update route – supports assigning technician and/or updating status
// Accepts body: { technician_id | technicianId, status }
router.put('/:id', restrictTo('admin','technician'), UpdateRequestById);
router.patch('/:id', restrictTo('admin','technician'), UpdateRequestById);

router.patch('/assign/:id', restrictTo('technician'), AssignRequest);
router.patch('/status/:id', restrictTo('admin','technician'), UpdateStatus);

router.delete('/:id', restrictTo('admin'), DeleteRequestById);

module.exports = router;
