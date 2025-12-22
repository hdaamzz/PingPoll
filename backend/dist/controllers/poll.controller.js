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
exports.PollController = void 0;
const tsyringe_1 = require("tsyringe");
const http_status_constants_1 = require("../constants/http-status.constants");
const messages_constants_1 = require("../constants/messages.constants");
const create_poll_dto_1 = require("../shared/dtos/poll/create-poll.dto");
const update_poll_dto_1 = require("../shared/dtos/poll/update-poll.dto");
let PollController = class PollController {
    pollService;
    constructor(pollService) {
        this.pollService = pollService;
    }
    createPoll = async (req, res) => {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(http_status_constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: messages_constants_1.POLL_MESSAGES.POLL_UNAUTHORIZED
                });
                return;
            }
            const createPollDto = new create_poll_dto_1.CreatePollDto(req.body);
            const poll = await this.pollService.createPoll(userId, createPollDto);
            res.status(http_status_constants_1.HTTP_STATUS.CREATED).json({
                success: true,
                message: messages_constants_1.POLL_MESSAGES.POLL_CREATED,
                data: poll.toJSON()
            });
        }
        catch (error) {
            res.status(http_status_constants_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || messages_constants_1.POLL_MESSAGES.POLL_CREATE_FAILED
            });
        }
    };
    getUserPolls = async (req, res) => {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(http_status_constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: messages_constants_1.POLL_MESSAGES.POLL_UNAUTHORIZED
                });
                return;
            }
            const polls = await this.pollService.getUserPolls(userId);
            res.status(http_status_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: { polls: polls.map(p => p.toJSON()) }
            });
        }
        catch (error) {
            res.status(http_status_constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || messages_constants_1.POLL_MESSAGES.POLL_FETCH_FAILED
            });
        }
    };
    getPollById = async (req, res) => {
        try {
            const { pollId } = req.params;
            const poll = await this.pollService.getPollById(pollId);
            res.status(http_status_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: poll.toJSON()
            });
        }
        catch (error) {
            const status = error.message === messages_constants_1.POLL_MESSAGES.POLL_NOT_FOUND
                ? http_status_constants_1.HTTP_STATUS.NOT_FOUND
                : http_status_constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
            res.status(status).json({
                success: false,
                message: error.message || messages_constants_1.POLL_MESSAGES.POLL_FETCH_FAILED
            });
        }
    };
    updatePoll = async (req, res) => {
        try {
            const userId = req.userId;
            const { pollId } = req.params;
            if (!userId) {
                res.status(http_status_constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: messages_constants_1.POLL_MESSAGES.POLL_UNAUTHORIZED
                });
                return;
            }
            const updatePollDto = new update_poll_dto_1.UpdatePollDto(req.body);
            const poll = await this.pollService.updatePoll(pollId, userId, updatePollDto);
            res.status(http_status_constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: messages_constants_1.POLL_MESSAGES.POLL_UPDATED,
                data: poll.toJSON()
            });
        }
        catch (error) {
            const status = error.message === messages_constants_1.POLL_MESSAGES.POLL_UNAUTHORIZED
                ? http_status_constants_1.HTTP_STATUS.FORBIDDEN
                : http_status_constants_1.HTTP_STATUS.BAD_REQUEST;
            res.status(status).json({
                success: false,
                message: error.message || messages_constants_1.POLL_MESSAGES.POLL_UPDATE_FAILED
            });
        }
    };
    deletePoll = async (req, res) => {
        try {
            const userId = req.userId;
            const { pollId } = req.params;
            if (!userId) {
                res.status(http_status_constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: messages_constants_1.POLL_MESSAGES.POLL_UNAUTHORIZED
                });
                return;
            }
            await this.pollService.deletePoll(pollId, userId);
            res.status(http_status_constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: messages_constants_1.POLL_MESSAGES.POLL_DELETED
            });
        }
        catch (error) {
            const status = error.message === messages_constants_1.POLL_MESSAGES.POLL_UNAUTHORIZED
                ? http_status_constants_1.HTTP_STATUS.FORBIDDEN
                : http_status_constants_1.HTTP_STATUS.BAD_REQUEST;
            res.status(status).json({
                success: false,
                message: error.message || messages_constants_1.POLL_MESSAGES.POLL_DELETE_FAILED
            });
        }
    };
    voteOnPoll = async (req, res) => {
        try {
            const userId = req.userId;
            const { pollId, optionId } = req.params;
            if (!userId) {
                res.status(http_status_constants_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: messages_constants_1.POLL_MESSAGES.POLL_UNAUTHORIZED
                });
                return;
            }
            const poll = await this.pollService.voteOnPoll(pollId, optionId, userId);
            res.status(http_status_constants_1.HTTP_STATUS.OK).json({
                success: true,
                message: messages_constants_1.POLL_MESSAGES.POLL_VOTE_SUCCESS,
                data: poll.toJSON()
            });
        }
        catch (error) {
            res.status(http_status_constants_1.HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: error.message || messages_constants_1.POLL_MESSAGES.POLL_VOTE_FAILED
            });
        }
    };
    getActivePolls = async (req, res) => {
        try {
            const polls = await this.pollService.getActivePolls();
            res.status(http_status_constants_1.HTTP_STATUS.OK).json({
                success: true,
                data: { polls: polls.map(p => p.toJSON()) }
            });
        }
        catch (error) {
            res.status(http_status_constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || messages_constants_1.POLL_MESSAGES.POLL_FETCH_FAILED
            });
        }
    };
};
exports.PollController = PollController;
exports.PollController = PollController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IPollService')),
    __metadata("design:paramtypes", [Object])
], PollController);
