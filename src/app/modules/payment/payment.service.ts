/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/AppError";
import { BOOKING_STATUS } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";
import { ISSLCommerz } from '../sslCommerz/sslCommerz.interface';
import { SSLService } from '../sslCommerz/sslCommerz.service';


const initPayment = async (bookingId: string) => {

    const payment = await Payment.findOne({ booking: bookingId })

    if (!payment) {
        throw new AppError(httpStatus.NOT_FOUND, "payment not found.you have not booked this")
    }

    const booking = await Booking.findById(payment.booking)

    const userAddress = (booking?.user as any).address
    const userEmail = (booking?.user as any).email
    const userPhoneNumber = (booking?.user as any).phone
    const userName = (booking?.user as any).name

    const sslPayload: ISSLCommerz = {
        address: userAddress,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        name: userName,
        amount: payment.amount,
        transactionId: payment.transactionId
    }


    const sslPayment = await SSLService.sslPaymentInit(sslPayload)

    return {
        paymentUrl : sslPayment.GatewayPageURL
    }

}


const successPayment = async (query: Record<string, string>) => {
    const session = await Booking.startSession();
    session.startTransaction();

    try {

        const updatedPayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.PAID

        }, { new: true, runValidators: true, session })

        await Booking.findByIdAndUpdate(
            updatedPayment?.booking,
            { status: BOOKING_STATUS.COMPLETE },

            { runValidators: true, session }
        )




        await session.commitTransaction()
        session.endSession()

        return {
            success: true,
            message: "payment completed successfully"
        }

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error

    }


}


const failPayment = async (query: Record<string, string>) => {
    const session = await Booking.startSession();
    session.startTransaction();

    try {

        const updatedPayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.FAILED

        }, { runValidators: true, session })

        await Booking.findByIdAndUpdate(
            updatedPayment?.booking,
            { status: BOOKING_STATUS.FAILED },

            { new: true, runValidators: true, session }
        )




        await session.commitTransaction()
        session.endSession()

        return {
            success: false,
            message: "payment failed"
        }

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error

    }

}


const cancelPayment = async (query: Record<string, string>) => {
    const session = await Booking.startSession();
    session.startTransaction();

    try {

        const updatedPayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.CANCELLED

        }, { runValidators: true, session })

        await Booking.findByIdAndUpdate(
            updatedPayment?.booking,
            { status: BOOKING_STATUS.CANCEL },

            { runValidators: true, session }
        )




        await session.commitTransaction()
        session.endSession()

        return {
            success: false,
            message: "payment canceled"
        }

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        throw error

    }

}

export const paymentServices = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment
}