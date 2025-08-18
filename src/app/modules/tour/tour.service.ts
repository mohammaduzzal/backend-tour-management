import { tourSearchableFields, tourTypeSearchableFields } from "./tour.contant";
import { ITour, ITourType } from "./tour.interface";
import { Tour, TourType } from "./tour.model";
import { QueryBuilder } from "../../utils/QueryBuilders";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";

const createTour = async (payload: ITour) => {

    const existingTour = await Tour.findOne({ title: payload.title })
    if (existingTour) {
        throw new Error("A tour with this name already exist")
    }

    const tour = await Tour.create(payload)
    return tour

}


const getAllTours = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(Tour.find(), query)

    const tours =  queryBuilder
        .search(tourSearchableFields)
        .filter()
        .sort()
        .fields()
        .pagination()



    const [data, meta] = await Promise.all([
        tours.build(),
        queryBuilder.getMeta()
    ])


    return {
        data,
        meta
    }
}

const getSingleTour = async (slug: string) => {
    const tour = await Tour.findOne({ slug })
    return {
        data: tour
    }
}

const updateTour = async (id: string, payload: Partial<ITour>) => {
    const existingTour = await Tour.findById(id)
    if (!existingTour) {
        throw new Error("Tour not found")
    }


    if (payload.images && payload.images.length > 0 && existingTour.images && existingTour.images.length > 0) {
        payload.images = [...payload.images, ...existingTour.images]
    }


    if (payload.deletedImages && payload.deletedImages.length > 0 && existingTour.images && existingTour.images.length > 0) {

        const restDBImages = existingTour.images.filter(imageUrl => !payload.deletedImages?.includes(imageUrl))

        const updatedPayloadImages = (payload.images || [])
            .filter(imageUrl => !payload.deletedImages?.includes(imageUrl))
            .filter(imageUrl => !restDBImages.includes(imageUrl))




        payload.images = [...restDBImages, ...updatedPayloadImages]
    }



    const updateTour = await Tour.findByIdAndUpdate(id, payload, { new: true })



    if (payload.deletedImages && payload.deletedImages.length > 0 && existingTour.images && existingTour.images.length > 0) {


        await Promise.all(payload.deletedImages.map(url => deleteImageFromCloudinary(url)))
    }



    return updateTour
}

const deleteTour = async (id: string) => {
    await Tour.findByIdAndDelete(id)
    return null
}

// ---------------tour type-------------------------

const createTourType = async (payload: ITourType) => {
    const existTourType = await TourType.findOne({ name: payload.name })

    if (existTourType) {
        throw new Error("tour type already exist")
    }
    const tourType = await TourType.create(payload)
    return tourType

}

const getAllTourTypes = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(TourType.find(), query)

    const tourTypes = await queryBuilder
        .filter()
        .search(tourTypeSearchableFields)
        .sort()
        .fields()
        .pagination()

    const [data, meta] = await Promise.all([
        tourTypes.build(),
        queryBuilder.getMeta()
    ])



    return {
        data,
        meta
    }
}

const updateTourType = async (id: string, payload: ITourType) => {
    const existingTourType = await TourType.findById(id)
    if (!existingTourType) {
        throw new Error("tour type not found")
    }

    const updatedTourType = await TourType.findByIdAndUpdate(id, payload, { new: true, runValidators: true })

    return updatedTourType
}

const deleteTourType = async (id: string) => {
    const existingTourType = await TourType.findById(id)
    if (!existingTourType) {
        throw new Error("tour type not found")
    }

    await TourType.findByIdAndDelete(id)
    return null
}



export const TourServices = {
    createTour,
    getAllTours,
    getSingleTour,
    updateTour,
    deleteTour,
    createTourType,
    getAllTourTypes,
    updateTourType,
    deleteTourType

}