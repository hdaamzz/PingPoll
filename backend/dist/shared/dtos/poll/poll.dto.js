"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollDto = void 0;
class PollDto {
    id;
    title;
    question;
    options;
    totalVotes;
    status;
    createdBy;
    createdAt;
    updatedAt;
    expiresAt;
    constructor(poll) {
        this.id = poll._id.toString();
        this.title = poll.title;
        this.question = poll.question;
        this.totalVotes = poll.totalVotes;
        this.status = poll.status;
        this.createdBy = poll.createdBy.toString();
        this.createdAt = poll.createdAt;
        this.updatedAt = poll.updatedAt;
        this.expiresAt = poll.expiresAt;
        this.options = poll.options.map(opt => ({
            id: opt.id,
            text: opt.text,
            votes: opt.votes,
            percentage: this.calculatePercentage(opt.votes, poll.totalVotes)
        }));
    }
    calculatePercentage(votes, total) {
        return total === 0 ? 0 : Math.round((votes / total) * 100);
    }
    static fromModel(poll) {
        return new PollDto(poll);
    }
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            question: this.question,
            options: this.options,
            totalVotes: this.totalVotes,
            status: this.status,
            createdBy: this.createdBy,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            expiresAt: this.expiresAt
        };
    }
}
exports.PollDto = PollDto;
