/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/AppError"
import { User } from "../user/user.model"
import { BOOKING_STATUS, IBooking } from "./booking.interface"
import { Booking } from './booking.model';
import { Payment } from '../payment/payment.model';
import { PAYMENT_STATUS } from '../payment/payment.interface';
import { Tour } from '../tour/tour.model';
import { SSLService } from '../sslCommerz/sslCommerz.service';
import { ISSLCommerz } from '../sslCommerz/sslCommerz.interface';
import { QueryBuilder } from '../../utils/QueryBuilders';
import { getTransactionId } from '../../utils/getTransactionId';



const createBooking = async (payload: Partial<IBooking>, userId: string) => {
    const transactionId = getTransactionId();


    const session = await Booking.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(userId);


        if (!user?.phone || !user.address) {
            throw new AppError(httpStatus.BAD_REQUEST, "please update your profile to book a tour")
        }


        const tour = await Tour.findById(payload.tour).select("costForm")

        if (!tour?.costForm) {
            throw new AppError(httpStatus.BAD_REQUEST, " no tour costForm found")
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const amount = Number(tour.costForm) * Number(payload.guestCount!)

        const booking = await Booking.create([{
            user: userId,
            status: BOOKING_STATUS.PENDING,
            ...payload
        }], { session })

        const payment = await Payment.create([{
            booking: booking[0]._id,
            status: PAYMENT_STATUS.UNPAID,
            transactionId: transactionId,
            amount: amount

        }], { session })

        const updatedBooing = await Booking.findByIdAndUpdate(
            booking[0]._id,
            { payment: payment[0]._id },

            { new: true, runValidators: true, session }
        )
            .populate("user", "name phone  email address")
            .populate("tour", "title costForm")
            .populate("payment");

        const userAddress = (updatedBooing?.user as any).address
        const userEmail = (updatedBooing?.user as any).email
        const userPhoneNumber = (updatedBooing?.user as any).phone
        const userName = (updatedBooing?.user as any).name

        const sslPayload: ISSLCommerz = {
            address: userAddress,
            email: userEmail,
            phoneNumber: userPhoneNumber,
            name: userName,
            amount: amount,
            transactionId: transactionId
        }


        const sslPayment = await SSLService.sslPaymentInit(sslPayload)


        await session.commitTransaction()
        session.endSession()

        return {
            payment: sslPayment.GatewayPageURL,
            booking: updatedBooing
        }

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error

    }




}

const getAllBooking = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Booking.find(), query)

    const bookingData = queryBuilder
        .filter()
        .sort()
        .fields()
        .pagination()

    const [data, meta] = await Promise.all([
        bookingData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }

}

const getSingleBooking = async (id: string) => {
    const booking = await Booking.findById(id)
        .populate("user", "name phone email address")
        .populate("tour", "title costForm")
        .populate("payment")

    return {
        data: booking
    }
}

const updateBookingStatus = async (id: string, payload: Partial<IBooking>) => {
    const isBookingExist = await Booking.findById(id)
    if (!isBookingExist) {
        throw new Error("booking not found")
    }

    const updateBookingStatus = await Booking.findByIdAndUpdate(id, payload, { new: true, runValidators: true })

    return updateBookingStatus
}

const getMyBooking = async (userId: string) => {
    const myBookings = await Booking.find({ user: userId })
        .populate("user", "name phone email address")
        .populate("tour", "title costForm")
        .populate("payment")



    return {
        data : myBookings
    }
}



export const BookingServices = {
    createBooking,
    getAllBooking,
    getSingleBooking,
    updateBookingStatus,
    getMyBooking
}