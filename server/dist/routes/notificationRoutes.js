"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NotificationController_1 = require("../controllers/NotificationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.authenticateToken, NotificationController_1.getNotifications);
router.patch('/:id/read', authMiddleware_1.authenticateToken, NotificationController_1.markAsRead);
exports.default = router;
