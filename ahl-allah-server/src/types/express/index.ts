declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                roleId: number;
                iat?: number;
                exp?: number;
            };
        }
    }
}

export {}