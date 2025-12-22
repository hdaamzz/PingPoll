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
exports.MessageService = void 0;
const tsyringe_1 = require("tsyringe");
const messages_constants_1 = require("../constants/messages.constants");
let MessageService = class MessageService {
    messageRepository;
    constructor(messageRepository) {
        this.messageRepository = messageRepository;
    }
    async createMessage(data) {
        if (!data.text.trim()) {
            throw new Error(messages_constants_1.MESSAGE_MESSAGES.MESSAGE_EMPTY);
        }
        if (data.text.length > 1000) {
            throw new Error(messages_constants_1.MESSAGE_MESSAGES.MESSAGE_TOO_LONG);
        }
        const message = await this.messageRepository.create({
            pollId: data.pollId,
            userId: data.userId,
            userName: data.userName,
            userPicture: data.userPicture,
            text: data.text.trim()
        });
        return this.toDto(message);
    }
    async getPollMessages(pollId, limit = 100) {
        const messages = await this.messageRepository.findByPollId(pollId, limit);
        return messages.map(msg => this.toDto(msg));
    }
    async deleteMessage(messageId, userId) {
        const message = await this.messageRepository.findById(messageId);
        if (!message) {
            throw new Error(messages_constants_1.MESSAGE_MESSAGES.MESSAGE_NOT_FOUND);
        }
        if (message.userId.toString() !== userId) {
            throw new Error(messages_constants_1.MESSAGE_MESSAGES.MESSAGE_UNAUTHORIZED);
        }
        await this.messageRepository.delete(messageId);
    }
    async deletePollMessages(pollId) {
        await this.messageRepository.deleteByPollId(pollId);
    }
    toDto(message) {
        return {
            id: message._id.toString(),
            pollId: message.pollId.toString(),
            userId: message.userId.toString(),
            userName: message.userName,
            userPicture: message.userPicture,
            text: message.text,
            timestamp: message.createdAt
        };
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IMessageRepository')),
    __metadata("design:paramtypes", [Object])
], MessageService);
