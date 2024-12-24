const appConfig = () => ({
    port: parseInt(process.env.PORT, 10) || 5000,
    jwt: {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: process.env.JWT_EXPIRES_IN,
    },
    client: {
        url: process.env.CLIENT_URL
    },
    files: {
        filesPath: process.env.FILES_PATH,
        uploadLimit:process.env.FILE_MAX_SIZE
    }
});

export default appConfig;