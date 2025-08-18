import { model, Schema } from "mongoose";
import { GRole, IGuide } from "./guide.interface";

const guideSchema = new Schema<IGuide>({
    user : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    nidPhoto : {
        type : String
    },
    division : {
        type : Schema.Types.ObjectId,
        ref:"Division",
        required : true
    },
    status : {
        type : String,
        enum : Object.values(GRole),
        default : GRole.PENDING
    }
},{
    timestamps : true,
    versionKey:false
})

export const Guide = model<IGuide>("Guide", guideSchema)