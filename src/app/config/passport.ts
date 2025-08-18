import bcryptjs from 'bcryptjs';
/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as googleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { IsActive, Role } from "../modules/user/user.interface";
import { Strategy as localStrategy } from "passport-local";


passport.use(
    new localStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email: string, password: string, done) => {
        try {
            const isUserExist = await User.findOne({ email })

            if (!isUserExist) {
                return done(null, false, { message: "user not exist" })
            }


            if (!isUserExist.isVerified) {
                return done("user not verified")
            }


            if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
                return done(`user is ${isUserExist.isActive}`)
            }


            if (isUserExist.isDelete) {
                //    throw new AppError(httpStatus.BAD_REQUEST,"user is deleted")
                return done("user is deleted")
            }





            const isGoogleAuthenticated = isUserExist.auths.some(providerObjects => providerObjects.provider === "google")

            if (isGoogleAuthenticated && !isUserExist.password) {
                return done(null, false, { message: "you have authenticated through google.if you want to login with credentials,then at first login with google and set a password for your gmail and then you can login with email and password" })
            }


            const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)
            if (!isPasswordMatched) {
                return done(null, false, { message: "password does not match" })
            }
            done(null, isUserExist)

        } catch (error) {
            console.log(error);
            done(error)

        }
    })
)


passport.use(
    new googleStrategy(
        {
            clientID: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            callbackURL: envVars.GOOGLE_CALLBACK_URL,
        }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
            try {
                const email = profile.emails?.[0].value;

                if (!email) {
                    return done(null, false, { message: "no email found" })
                }

                let isUserExist = await User.findOne({ email })

                if (isUserExist && !isUserExist.isVerified) {
                    return done(null, false, { message: "user not verified" })
                }


                if (isUserExist && (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE)) {
                    return done(null, false, { message: `user is ${isUserExist.isActive}` })
                }


                if (isUserExist && isUserExist.isDelete) {
                    return done(null,false, {message : "user is deleted"})
                }




                if (!isUserExist) {
                    isUserExist = await User.create({
                        email,
                        name: profile.displayName,
                        picture: profile.photos?.[0].value,
                        role: Role.USER,
                        isVerified: true,
                        auths: [
                            {
                                providerId: profile.id,
                                provider: "google"
                            }
                        ]
                    })
                }

                return done(null, isUserExist)

            } catch (error) {
                console.log("google strategy error", error);
                return done(error)

            }
        }
    )
)

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id)
})

passport.deserializeUser(async (id: string, done: any) => {
    try {

        const user = await User.findById(id)
        done(null, user)

    } catch (error) {
        done(error)
    }
})