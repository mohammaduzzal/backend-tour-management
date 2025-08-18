import { QueryBuilder } from "../../utils/QueryBuilders"
import { IGuide } from "./guide.interface"
import { Guide } from "./guide.model"

const createGuide = async(payload : IGuide)=>{
    const isGuideExist = await Guide.findOne({user : payload.user})
    if(isGuideExist){
        throw new Error("A guide with this name already exist")
    }

    const guide = await Guide.create(payload)


    return guide
}


const updateGuide = async(guideId :string,payload : Partial<IGuide>) =>{
    const isGuideExist = await Guide.findById(guideId)
    if(!isGuideExist){
        throw new Error("guide not found")
    }

    const updateGuide = await Guide.findByIdAndUpdate(guideId,payload,{new:true})


    return updateGuide
}

const getAllGuides = async(query : Record<string,string>)=>{
    const queryBuilder = new QueryBuilder(Guide.find(), query)

    const guides = queryBuilder
    .filter()
    .pagination()

    const [data,meta] = await Promise.all([
        guides.build().populate("user", "name email").populate("division","name"),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
}


const getSingleGuide = async(guideId : string)=>{
    const guide = await Guide.findById(guideId)

    return guide
}


export const GuideServices = {
    createGuide,
    updateGuide,
    getAllGuides,
    getSingleGuide
}