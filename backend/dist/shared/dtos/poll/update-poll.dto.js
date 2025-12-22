"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePollDto = void 0;
class UpdatePollDto {
    title;
    question;
    status;
    expiresAt;
    constructor(data) {
        if (data.title)
            this.title = data.title.trim();
        if (data.question)
            this.question = data.question.trim();
        if (data.status)
            this.status = data.status;
        if (data.expiresAt)
            this.expiresAt = data.expiresAt;
    }
}
exports.UpdatePollDto = UpdatePollDto;
