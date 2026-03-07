"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamController = void 0;
const common_1 = require("@nestjs/common");
const exam_service_1 = require("./exam.service");
const exam_dto_1 = require("./dto/exam.dto");
const passport_1 = require("@nestjs/passport");
let ExamController = class ExamController {
    examService;
    constructor(examService) {
        this.examService = examService;
    }
    startTest(req, startTestDto) {
        return this.examService.startTest(req.user.userId, startTestDto);
    }
    submitAnswer(req, submitDto) {
        return this.examService.submitAnswer(req.user.userId, submitDto);
    }
    clearAnswer(req, body) {
        return this.examService.clearAnswer(req.user.userId, body.attemptId, body.questionId);
    }
    finishTest(req, body) {
        return this.examService.finishTest(req.user.userId, body.attemptId);
    }
    getQuestions(req, attemptId) {
        return this.examService.getExamQuestions(req.user.userId, attemptId);
    }
    getResult(req, attemptId) {
        return this.examService.getAttemptResult(req.user.userId, attemptId);
    }
};
exports.ExamController = ExamController;
__decorate([
    (0, common_1.Post)('start'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, exam_dto_1.StartTestDto]),
    __metadata("design:returntype", void 0)
], ExamController.prototype, "startTest", null);
__decorate([
    (0, common_1.Post)('submit-answer'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, exam_dto_1.SubmitAnswerDto]),
    __metadata("design:returntype", void 0)
], ExamController.prototype, "submitAnswer", null);
__decorate([
    (0, common_1.Post)('clear-answer'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ExamController.prototype, "clearAnswer", null);
__decorate([
    (0, common_1.Post)('finish'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ExamController.prototype, "finishTest", null);
__decorate([
    (0, common_1.Get)(':attemptId/questions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('attemptId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ExamController.prototype, "getQuestions", null);
__decorate([
    (0, common_1.Get)('result/:attemptId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('attemptId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ExamController.prototype, "getResult", null);
exports.ExamController = ExamController = __decorate([
    (0, common_1.Controller)('exam'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [exam_service_1.ExamService])
], ExamController);
//# sourceMappingURL=exam.controller.js.map