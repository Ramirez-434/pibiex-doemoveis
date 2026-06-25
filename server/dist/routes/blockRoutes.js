"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const BlockController_1 = require("../controllers/BlockController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticateToken);
router.post('/', BlockController_1.blockUser);
router.delete('/:blockedId', BlockController_1.unblockUser);
router.get('/', BlockController_1.getBlockedUsers);
exports.default = router;
