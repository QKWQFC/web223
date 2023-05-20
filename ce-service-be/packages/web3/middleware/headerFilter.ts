import { Request, Response, NextFunction } from 'express';
const headMiddleWare = (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers['x-2to3-accesstoken'];
    if (!accessToken || Array.isArray(accessToken)) {
        res.status(400).send('Bad Request: Missing or invalid X-2to3-accessToken header');
        return;
    }
    next();
}

export {
    headMiddleWare
}