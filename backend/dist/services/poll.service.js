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
exports.PollService = void 0;
const tsyringe_1 = require("tsyringe");
const poll_dto_1 = require("../shared/dtos/poll/poll.dto");
const messages_constants_1 = require("../constants/messages.constants");
let PollService = class PollService {
    pollRepository;
    constructor(pollRepository) {
        this.pollRepository = pollRepository;
    }
    async createPoll(userId, createPollDto) {
        const pollData = {
            title: createPollDto.title,
            question: createPollDto.question,
            options: createPollDto.options.map(opt => ({
                ...opt,
                votes: 0,
                votedBy: []
            })),
            createdBy: userId,
            status: 'active',
            totalVotes: 0,
            expiresAt: createPollDto.expiresAt
        };
        const poll = await this.pollRepository.create(pollData);
        return poll_dto_1.PollDto.fromModel(poll);
    }
    async getUserPolls(userId) {
        const polls = await this.pollRepository.findByCreator(userId);
        return polls.map(poll => poll_dto_1.PollDto.fromModel(poll));
    }
    async getPollById(pollId) {
        const poll = await this.pollRepository.findByIdWithCreator(pollId);
        if (!poll) {
            throw new Error(messages_constants_1.POLL_MESSAGES.POLL_NOT_FOUND);
        }
        return poll_dto_1.PollDto.fromModel(poll);
    }
    async updatePoll(pollId, userId, updatePollDto) {
        const poll = await this.pollRepository.findById(pollId);
        if (!poll) {
            throw new Error(messages_constants_1.POLL_MESSAGES.POLL_NOT_FOUND);
        }
        if (poll.createdBy.toString() !== userId) {
            throw new Error(messages_constants_1.POLL_MESSAGES.POLL_UNAUTHORIZED);
        }
        const updatedPoll = await this.pollRepository.update(pollId, updatePollDto);
        if (!updatedPoll) {
            throw new Error(messages_constants_1.POLL_MESSAGES.POLL_UPDATE_FAILED);
        }
        return poll_dto_1.PollDto.fromModel(updatedPoll);
    }
    async deletePoll(pollId, userId) {
        const poll = await this.pollRepository.findById(pollId);
        if (!poll) {
            throw new Error(messages_constants_1.POLL_MESSAGES.POLL_NOT_FOUND);
        }
        if (poll.createdBy.toString() !== userId) {
            throw new Error(messages_constants_1.POLL_MESSAGES.POLL_UNAUTHORIZED);
        }
        await this.pollRepository.delete(pollId);
    }
    async voteOnPoll(pollId, optionId, userId) {
        const poll = await this.pollRepository.findById(pollId);
        if (!poll) {
            throw new Error(messages_constants_1.POLL_MESSAGES.POLL_NOT_FOUND);
        }
        if (poll.status !== 'active') {
            throw new Error(messages_constants_1.POLL_MESSAGES.POLL_NOT_ACTIVE);
        }
        if (poll.expiresAt && poll.expiresAt < new Date()) {
            await this.pollRepository.update(pollId, { status: 'closed' });
            throw new Error(messages_constants_1.POLL_MESSAGES.POLL_EXPIRED);
        }
        const updatedPoll = await this.pollRepository.updateVote(pollId, optionId, userId);
        if (!updatedPoll) {
            throw new Error(messages_constants_1.POLL_MESSAGES.POLL_VOTE_FAILED);
        }
        return poll_dto_1.PollDto.fromModel(updatedPoll);
    }
    async getActivePolls() {
        const polls = await this.pollRepository.findActivePolls();
        return polls.map(poll => poll_dto_1.PollDto.fromModel(poll));
    }
};
exports.PollService = PollService;
exports.PollService = PollService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IPollRepository')),
    __metadata("design:paramtypes", [Object])
], PollService);
