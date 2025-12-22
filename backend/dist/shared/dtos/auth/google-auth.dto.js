"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuthDto = void 0;
class GoogleAuthDto {
    firebaseToken;
    constructor(firebaseToken) {
        this.firebaseToken = firebaseToken;
    }
    static fromRequest(body) {
        return new GoogleAuthDto(body.firebaseToken);
    }
}
exports.GoogleAuthDto = GoogleAuthDto;
