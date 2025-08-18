/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/AppError";
import { BOOKING_STATUS, IBooking } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";
import { ISSLCommerz } from '../sslCommerz/sslCommerz.interface';
import { SSLService } from '../sslCommerz/sslCommerz.service';
import { generatePDF, IInvoiceData } from '../../utils/invoice';
import { ITour } from '../tour/tour.interface';
import { IUser } from '../user/user.interface';
import { sendEmail } from '../../utils/sentEmail';
import { uploadBufferToCloudinary } from '../../config/cloudinary.config';
import mongoose from 'mongoose';


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


        if(!updatedPayment){
            throw new AppError(401,"payment not found")
        }



       const updatedBooking =  await Booking.findByIdAndUpdate(
            updatedPayment?.booking,
            { status: BOOKING_STATUS.COMPLETE },

            { new:true,runValidators: true, session }
        )
        .populate("tour", "title")
        .populate("user", "name email")

        if(!updatedBooking){
            throw new AppError(401,"booking not found")
        }


        // pdf generate
        const invoiceData :IInvoiceData = {
            bookingDate : updatedBooking.createdAt as Date,
            guestCount : updatedBooking.guestCount,
            totalAmount:updatedPayment.amount,
            tourTitle : (updatedBooking.tour as unknown as ITour).title,
            transactionId: updatedPayment.transactionId,
            userName: (updatedBooking.user as unknown as IUser).name

        }

        const pdfBuffer = await generatePDF(invoiceData)

        const cloudinaryResult = await uploadBufferToCloudinary(pdfBuffer,"invoice")

        if(!cloudinaryResult){
            throw new AppError(401, "error uploading pdf")
        }
       
        await Payment.findByIdAndUpdate(updatedPayment._id, {invoiceUrl : cloudinaryResult.secure_url}, {runValidators :true,session})

        await sendEmail({
            to : (updatedBooking.user as unknown as IUser).email,
            subject : "your booking invoice",
            templateName: "invoice",
            templateData : invoiceData,
            attachments :[
                {
                    fileName : "invoice.pdf",
                    content : pdfBuffer,
                    contentType : "application/pdf"
                }
            ]
        })




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


const getInvoiceDownloadUri = async(paymentId :string) =>{
    const payment = await Payment.findById(paymentId)
    .select("invoiceUrl")
   
    

    

    if(!payment){
        throw new AppError(401, "payment not found")
    }


    if(!payment.invoiceUrl){
        throw new AppError(401, "no invoice found")
    }

    return payment.invoiceUrl



}

export const paymentServices = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceDownloadUri
}