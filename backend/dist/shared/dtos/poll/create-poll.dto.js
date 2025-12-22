"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePollDto = void 0;
class CreatePollDto {
    title;
    question;
    options;
    expiresAt;
    constructor(data) {
        this.title = data.title.trim();
        this.question = data.question.trim();
        this.options = data.options
            .map(opt => ({ ...opt, text: opt.text.trim() }))
            .filter(opt => opt.text.length > 0);
        this.expiresAt = data.expiresAt;
        this.validate();
    }
    validate() {
        if (!this.title || this.title.length < 3) {
            throw new Error('Title must be at least 3 characters long');
        }
        if (!this.question || this.question.length < 5) {
            throw new Error('Question must be at least 5 characters long');
        }
        if (this.options.length < 2) {
            throw new Error('Poll must have at least 2 options');
        }
        if (this.options.length > 6) {
            throw new Error('Poll cannot have more than 6 options');
        }
        if (this.expiresAt && this.expiresAt <= new Date()) {
            throw new Error('Expiration date must be in the future');
        }
    }
}
exports.CreatePollDto = CreatePollDto;
