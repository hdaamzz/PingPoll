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
exports.SocketService = void 0;
const tsyringe_1 = require("tsyringe");
const poll_dto_1 = require("../shared/dtos/poll/poll.dto");
const jwt_util_1 = require("../shared/utils/jwt.util");
let SocketService = class SocketService {
    pollRepository;
    messageService;
    io;
    pollRooms = new Map();
    typingUsers = new Map();
    constructor(pollRepository, messageService) {
        this.pollRepository = pollRepository;
        this.messageService = messageService;
    }
    initialize(io) {
        this.io = io;
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    console.error('Socket auth failed: No token provided');
                    return next(new Error('Authentication token required'));
                }
                const decoded = jwt_util_1.JwtUtil.verifyToken(token);
                if (!decoded || !decoded.userId) {
                    console.error('Socket auth failed: Invalid token');
                    return next(new Error('Invalid authentication token'));
                }
                socket.userId = decoded.userId;
                socket.userName = socket.handshake.auth.userName || 'Anonymous';
                socket.userPicture = socket.handshake.auth.userPicture || '';
                next();
            }
            catch (error) {
                console.error('Socket auth error:', error.message);
                next(new Error('Authentication failed: ' + error.message));
            }
        });
        this.io.on('connection', (socket) => {
            this.handlePollJoin(socket);
            this.handlePollLeave(socket);
            this.handleVote(socket);
            this.handleChatMessage(socket);
            this.handleTyping(socket);
            this.handleStopTyping(socket);
            this.handleDisconnect(socket);
        });
    }
    handlePollJoin(socket) {
        socket.on('poll:join', async (pollId) => {
            try {
                const poll = await this.pollRepository.findById(pollId);
                if (!poll) {
                    socket.emit('error', { message: 'Poll not found' });
                    return;
                }
                socket.join(`poll:${pollId}`);
                if (!this.pollRooms.has(pollId)) {
                    this.pollRooms.set(pollId, new Set());
                }
                this.pollRooms.get(pollId).add(socket.userId);
                const pollDto = poll_dto_1.PollDto.fromModel(poll);
                socket.emit('poll:data', pollDto.toJSON());
                const messages = await this.messageService.getPollMessages(pollId, 100);
                socket.emit('chat:history', messages);
                socket.to(`poll:${pollId}`).emit('user:joined', {
                    userId: socket.userId,
                    userName: socket.userName,
                    userPicture: socket.userPicture,
                    activeUsers: this.pollRooms.get(pollId).size
                });
                socket.emit('poll:activeUsers', {
                    count: this.pollRooms.get(pollId).size
                });
            }
            catch (error) {
                console.error('Error joining poll:', error);
                socket.emit('error', { message: 'Failed to join poll' });
            }
        });
    }
    handlePollLeave(socket) {
        socket.on('poll:leave', (pollId) => {
            this.leavePoll(socket, pollId);
        });
    }
    handleVote(socket) {
        socket.on('vote', async (data) => {
            try {
                const { pollId, optionId } = data;
                const updatedPoll = await this.pollRepository.updateVote(pollId, optionId, socket.userId);
                if (!updatedPoll) {
                    socket.emit('error', { message: 'Failed to record vote' });
                    return;
                }
                const pollDto = poll_dto_1.PollDto.fromModel(updatedPoll);
                this.io.to(`poll:${pollId}`).emit('poll:updated', pollDto.toJSON());
                socket.emit('vote:success', {
                    pollId,
                    optionId,
                    message: 'Vote recorded successfully'
                });
            }
            catch (error) {
                console.error('Error recording vote:', error);
                socket.emit('error', { message: 'Failed to record vote' });
            }
        });
    }
    handleChatMessage(socket) {
        socket.on('chat:message', async (data) => {
            try {
                const { pollId, text } = data;
                if (!text.trim()) {
                    return;
                }
                const savedMessage = await this.messageService.createMessage({
                    pollId,
                    userId: socket.userId,
                    userName: socket.userName,
                    userPicture: socket.userPicture,
                    text: text.trim()
                });
                this.io.to(`poll:${pollId}`).emit('chat:message', savedMessage);
                this.clearTyping(pollId, socket.userId);
            }
            catch (error) {
                console.error('Error sending chat message:', error);
                socket.emit('error', { message: error.message || 'Failed to send message' });
            }
        });
    }
    handleTyping(socket) {
        socket.on('chat:typing', (pollId) => {
            if (!this.typingUsers.has(pollId)) {
                this.typingUsers.set(pollId, new Map());
            }
            const typingUser = {
                userId: socket.userId,
                userName: socket.userName,
                userPicture: socket.userPicture
            };
            this.typingUsers.get(pollId).set(socket.userId, typingUser);
            socket.to(`poll:${pollId}`).emit('chat:userTyping', typingUser);
        });
    }
    handleStopTyping(socket) {
        socket.on('chat:stopTyping', (pollId) => {
            this.clearTyping(pollId, socket.userId);
        });
    }
    clearTyping(pollId, userId) {
        if (this.typingUsers.has(pollId)) {
            this.typingUsers.get(pollId).delete(userId);
            this.io.to(`poll:${pollId}`).emit('chat:userStoppedTyping', { userId });
        }
    }
    handleDisconnect(socket) {
        socket.on('disconnect', () => {
            this.pollRooms.forEach((users, pollId) => {
                if (users.has(socket.userId)) {
                    this.leavePoll(socket, pollId);
                }
            });
        });
    }
    leavePoll(socket, pollId) {
        socket.leave(`poll:${pollId}`);
        if (this.pollRooms.has(pollId)) {
            this.pollRooms.get(pollId).delete(socket.userId);
            socket.to(`poll:${pollId}`).emit('user:left', {
                userId: socket.userId,
                userName: socket.userName,
                activeUsers: this.pollRooms.get(pollId).size
            });
            this.clearTyping(pollId, socket.userId);
            if (this.pollRooms.get(pollId).size === 0) {
                this.pollRooms.delete(pollId);
                this.typingUsers.delete(pollId);
            }
        }
    }
    getIO() {
        return this.io;
    }
};
exports.SocketService = SocketService;
exports.SocketService = SocketService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IPollRepository')),
    __param(1, (0, tsyringe_1.inject)('IMessageService')),
    __metadata("design:paramtypes", [Object, Object])
], SocketService);
