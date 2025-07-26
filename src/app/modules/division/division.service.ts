import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import { QueryBuilder } from "../../utils/QueryBuilders";
import { divisionSearchableFields } from "./division.contant";
import { IDivision } from "./division.interface";
import { Division } from "./division.model";

const createDivision = async(payload : IDivision)=>{

    const existingDivision = await Division.findOne({name : payload.name})

    if(existingDivision){
        throw new Error("A division with this name is already exist")
    }


    const division = await Division.create(payload);

    return division



};

const getAllDivisions = async(query : Record<string,string>)=>{
    const queryBuilder = new QueryBuilder(Division.find(),query)

    const divisionData = queryBuilder
    .filter()
    .search(divisionSearchableFields)
    .sort()
    .fields()
    .pagination()

    const [data,meta] = await Promise.all([
        divisionData.build(),
        queryBuilder.getMeta()
    ])

    return{
        data,
        meta
    }
   
};

const getSingleDivision = async(slug : string)=>{
    const division = await Division.findOne({slug})

    return{
        data : division
    }
}

const updateDivision = async(id:string, payload : Partial<IDivision>)=>{
    const isDivisionExist = await Division.findById(id)
    if(!isDivisionExist){
        throw new Error("division not found")
    }

    const duplicateDivision = await Division.findOne({
        name : payload.name,
        _id : {$ne : id}
    })

    if(duplicateDivision){
        throw new Error("A division with this name already exit")
    }


    const updateDivision = await Division.findByIdAndUpdate(id, payload,{new :true,runValidators:true})

    if(payload.thumbnail && isDivisionExist.thumbnail){
        await deleteImageFromCloudinary(isDivisionExist.thumbnail)
    }

    return updateDivision
}

const deleteDivision = async(id : string)=>{
    await Division.findByIdAndDelete(id);
    return null;
}

export const DivisionServices = {
    createDivision,
    getAllDivisions,
    getSingleDivision,
    updateDivision,
    deleteDivision
}