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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollRepository = void 0;
const tsyringe_1 = require("tsyringe");
const base_repository_1 = require("./base/base.repository");
const poll_model_1 = __importDefault(require("../models/poll.model"));
let PollRepository = class PollRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(poll_model_1.default);
    }
    async findByCreator(userId) {
        return await this.model
            .find({ createdBy: userId })
            .sort({ createdAt: -1 })
            .exec();
    }
    async findActivePolls() {
        return await this.model
            .find({ status: 'active' })
            .sort({ createdAt: -1 })
            .exec();
    }
    async findByIdWithCreator(pollId) {
        return await this.model
            .findById(pollId)
            .populate('createdBy', 'name email picture')
            .exec();
    }
    async updateVote(pollId, optionId, userId) {
        const poll = await this.findById(pollId);
        if (!poll)
            return null;
        const option = poll.options.find(opt => opt.id === optionId);
        if (!option)
            return null;
        if (option.votedBy.includes(userId)) {
            return poll;
        }
        poll.options.forEach(opt => {
            const index = opt.votedBy.indexOf(userId);
            if (index > -1) {
                opt.votedBy.splice(index, 1);
                opt.votes = Math.max(0, opt.votes - 1);
                poll.totalVotes = Math.max(0, poll.totalVotes - 1);
            }
        });
        option.votedBy.push(userId);
        option.votes += 1;
        poll.totalVotes += 1;
        await poll.save();
        return poll;
    }
    async removeVote(pollId, optionId, userId) {
        const poll = await this.findById(pollId);
        if (!poll)
            return null;
        const option = poll.options.find(opt => opt.id === optionId);
        if (!option)
            return null;
        const index = option.votedBy.indexOf(userId);
        if (index > -1) {
            option.votedBy.splice(index, 1);
            option.votes = Math.max(0, option.votes - 1);
            poll.totalVotes = Math.max(0, poll.totalVotes - 1);
            await poll.save();
        }
        return poll;
    }
};
exports.PollRepository = PollRepository;
exports.PollRepository = PollRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], PollRepository);
