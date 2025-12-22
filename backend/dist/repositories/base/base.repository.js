"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async findById(id) {
        return await this.model.findById(id).exec();
    }
    async findOne(filter) {
        return await this.model.findOne(filter).exec();
    }
    async findAll(filter = {}) {
        return await this.model.find(filter).exec();
    }
    async create(data) {
        const entity = new this.model(data);
        return await entity.save();
    }
    async update(id, data) {
        return await this.model.findByIdAndUpdate(id, { ...data, updatedAt: new Date() }, { new: true }).exec();
    }
    async delete(id) {
        const result = await this.model.findByIdAndDelete(id).exec();
        return result !== null;
    }
}
exports.BaseRepository = BaseRepository;
