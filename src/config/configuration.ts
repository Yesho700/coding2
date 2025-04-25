

export default () => {
    return {
        app: {
            port: process.env.PORT
        },

        db: {
            uri: process.env.MONGO_URI
        },

        jwt: {
            secret: process.env.JWT_SECRET,
            expiresIn: process.env.JWT_EXPIRESIN
        },
        
        email: {
            service: process.env.SERVICE,
            userEmail: process.env.USER_EMAIL,
            userPass: process.env.USER_PASSWORD
        },

        redis: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        },

        aws:{
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            bucketName: process.env.AWS_BUCKET_NAME
        }
    }
}