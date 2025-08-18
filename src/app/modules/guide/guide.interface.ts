import { Types } from "mongoose";

export enum GRole {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED"
}
export interface IGuide{
    _id ?: string; 
    user : Types.ObjectId;
    nidPhoto ? : string;
    division : Types.ObjectId;
    status : GRole;
}