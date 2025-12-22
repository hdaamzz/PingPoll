"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDto = void 0;
const base_dto_1 = require("../base.dto");
class UserDto extends base_dto_1.BaseDto {
    id;
    name;
    email;
    emailVerified;
    picture;
    isOnline;
    lastSeen;
    constructor(id, name, email, emailVerified, picture, isOnline, lastSeen) {
        super();
        this.id = id;
        this.name = name;
        this.email = email;
        this.emailVerified = emailVerified;
        this.picture = picture;
        this.isOnline = isOnline;
        this.lastSeen = lastSeen;
    }
    static fromModel(user) {
        return new UserDto(user._id.toString(), user.name, user.email, user.emailVerified, user.picture, user.isOnline, user.lastSeen);
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            picture: this.picture,
            emailVerified: this.emailVerified,
            isOnline: this.isOnline,
            lastSeen: this.lastSeen,
        };
    }
}
exports.UserDto = UserDto;
