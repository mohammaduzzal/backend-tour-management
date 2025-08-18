/* eslint-disable @typescript-eslint/no-explicit-any */
import { Booking } from "../booking/booking.model"
import { PAYMENT_STATUS } from "../payment/payment.interface"
import { Payment } from "../payment/payment.model"
import { Tour } from "../tour/tour.model"
import { IsActive } from "../user/user.interface"
import { User } from "../user/user.model"

const now = new Date()
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7)
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30)


const getUserStats = async () => {
    const totalUsersPromise = User.countDocuments()
    const totalActiveUsersPromise = User.countDocuments({ isActive: IsActive.ACTIVE })
    const totalInActiveUsersPromise = User.countDocuments({ isActive: IsActive.INACTIVE })
    const totalBlockedUsersPromise = User.countDocuments({ isActive: IsActive.BLOCKED })



    const newUsersInLast7Promise = User.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    const newUsersInLast30Promise = User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })


    const usersByRolePromise = User.aggregate([
        // stage-1-grouping users by role
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 }
            }
        }
    ])


    const [totalUsers, totalActiveUsers, totalInActiveUsers, totalBlockedUsers, newUserInLast7, newUsersInLast30] = await Promise.all([
        totalUsersPromise,
        totalActiveUsersPromise,
        totalInActiveUsersPromise,
        totalBlockedUsersPromise,
        newUsersInLast7Promise,
        newUsersInLast30Promise,
        usersByRolePromise
    ])

    return {
        totalUsers,
        totalActiveUsers,
        totalInActiveUsers,
        totalBlockedUsers,
        newUserInLast7,
        newUsersInLast30
    }

}


const getTourStats = async () => {
    const totalTourPromise = Tour.countDocuments()

    const totalTourByTourTypePromise = Tour.aggregate([
        // stage-1-connect tourtypes model-lookup
        {
            $lookup: {
                from: "tourtypes",
                localField: "tourType",
                foreignField: "_id",
                as: "type"
            }
        },
        // stage-2-unwind the array to object
        {
            $unwind: "$type"
        },
        // stage-3-grouping the tourtype
        {
            $group:{
                _id:"$type.name",
                count : {$sum : 1}
            }
        }
    ])


    const avgTourCostPromise = Tour.aggregate([
        // stage-1: group the cost form,do sum and avg the sum
        {
            $group:{
                _id :null,
                avgCostFrom : {$avg : "$costForm"}
            }
        }
    ])


    const totalTourByDivisionPromise = Tour.aggregate([
        // stage-1:connect division model to lookup
        {
            $lookup :{
                from : "divisions",
                localField:"division",
                foreignField:"_id",
                as : "division"
            }
        },
        // stage-2:unwind the array object
        {
            $unwind:"$division"
        },
        // stage-3:grouping the division
        {
            $group:{
                _id:"$division.name",
                count :{$sum:1}
            }
        }


    ])

    const totalHighestBookedTourPromise  =Booking.aggregate([

        // stage-1:group the tour
        {
          $group:{  _id : "$tour",
            totalBookingCount : {$sum :1}
          }
        },
        // stage-2:sort the booking
        {
            $sort :{totalBookingCount : -1}
        },
        // stage-3:limit booking
        {
            $limit : 5
        },
        // stage-4:lookup tour name
        {
            $lookup:{
                from:"tours",
                // localField:"tour",
                let:{tourId : "$_id"},
                pipeline:[
                    {
                        $match:{
                            $expr:{$eq: ["$_id","$$tourId"]}
                        }
                    }
                ],
                as:"tour"
            }
        },
        // stage-5: unwind tour
        {
            $unwind:"$tour"
        },
        // stage-6:project
        {
            $project:{
                totalBookingCount : 1,
                "tour.title" : 1,
                "tour.slug" : 1
            }
        }

    ])








    const [totalTour, totalTourByTourType,avgTourCost,totalTourByDivision,totalHighestBookedTour] = await Promise.all([
        totalTourPromise,
        totalTourByTourTypePromise,
        avgTourCostPromise,
        totalTourByDivisionPromise,
        totalHighestBookedTourPromise
    ])


    return {
        totalTour,
        totalTourByTourType,
        avgTourCost,
        totalTourByDivision,
        totalHighestBookedTour
    }
}


const getBookingStats = async () => {
    const totalBookingPromise = Booking.countDocuments()

    const totalBookingByStatusPromise = Booking.aggregate([
        //stage-1 group stage
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ])

    const bookingsPerTourPromise = Booking.aggregate([
        //stage1 group stage

        {
            $group: {
                _id: "$tour",
                bookingCount: { $sum: 1 }
            }
        },

        //stage-2 sort stage
        {
            $sort: { bookingCount: -1 }
        },

        //stage-3 limit stage
        {
            $limit: 10
        },

        //stage-4 lookup stage
        {
            $lookup: {
                from: "tours",
                localField: "_id",
                foreignField: "_id",
                as: "tour"
            }
        },

        // stage5 - unwind stage
        {
            $unwind: "$tour"
        },

        // stage6 project stage

        {
            $project: {
                bookingCount: 1,
                _id: 1,
                "tour.title": 1,
                "tour.slug": 1
            }
        }
    ])

    const avgGuestCountPerBookingPromise = Booking.aggregate([
        // stage 1  - group stage
        {
            $group: {
                _id: null,
                avgGuestCount: { $avg: "$guestCount" }
            }
        }
    ])

    const bookingsLast7DaysPromise = Booking.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    })
    const bookingsLast30DaysPromise = Booking.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    })

    const totalBookingByUniqueUsersPromise = Booking.distinct("user").then((user: any) => user.length)

    const [totalBooking, totalBookingByStatus, bookingsPerTour, avgGuestCountPerBooking, bookingsLast7Days, bookingsLast30Days, totalBookingByUniqueUsers] = await Promise.all([
        totalBookingPromise,
        totalBookingByStatusPromise,
        bookingsPerTourPromise,
        avgGuestCountPerBookingPromise,
        bookingsLast7DaysPromise,
        bookingsLast30DaysPromise,
        totalBookingByStatusPromise,
        totalBookingByUniqueUsersPromise
    ])

    return { totalBooking, totalBookingByStatus, bookingsPerTour, avgGuestCountPerBooking: avgGuestCountPerBooking[0].avgGuestCount, bookingsLast7Days, bookingsLast30Days, totalBookingByUniqueUsers }
}


const getPaymentStats = async () => {

    const totalPaymentPromise = Payment.countDocuments()

    const totalPaymentByStatusPromise =Payment.aggregate([
        // stage-1:group
        {
            $group : {
                _id :"$status",
                count : {$sum : 1}
            }
        }
    ])


    const totalRevenuePromise = Payment.aggregate([
        // stage-1:match
        {
            $match:{status : PAYMENT_STATUS.PAID}
        },
        {
            $group :{
                _id:null,
                totalRevenue : {$sum : "$amount"}
            }
        }
    ])

      const avgPaymentAmountPromise = Payment.aggregate([
        //stage 1 group stage
        {
            $group: {
                _id: null,
                avgPaymentAMount: { $avg: "$amount" }
            }
        }
    ])

     const paymentGatewayDataPromise = Payment.aggregate([
        //stage 1 group stage
        {
            $group: {
                _id: { $ifNull: ["$paymentGatewayData.status", "UNKNOWN"] },
                count: { $sum: 1 }
            }
        }
    ])




    const [totalPayment,totalRevenue,totalPaymentByStatus,avgPaymentAmount,paymentGatewayData] =await Promise.all([
        totalPaymentPromise,
        totalRevenuePromise,
        totalPaymentByStatusPromise,
        avgPaymentAmountPromise,
        paymentGatewayDataPromise
    ])




    return{
        totalPayment,
        totalRevenue,
        totalPaymentByStatus,
        avgPaymentAmount,
        paymentGatewayData
    }
}








export const statsService = {
    getUserStats,
    getBookingStats,
    getTourStats,
    getPaymentStats
}