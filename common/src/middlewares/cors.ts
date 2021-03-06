export const corsOtions = {
  origin: 'http://localhost:4200',
  methos: 'GET, PUT, POST, DELETE, PATCH, OPTIONS',
  allowedHeaders:
    'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization',
  credentials: true,
};

// import { Request, Response, NextFunction } from 'express';

// export const allowCrossDomain = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
//   res.setHeader(
//     'Access-Control-Allow-Methods',
//     'GET, PUT, POST, DELETE, PATCH, OPTIONS'
//   );
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization'
//   );
//   res.setHeader('"Access-Control-Allow-Credentials', 'true');

//   // intercept OPTIONS method
//   if (req.method === 'OPTIONS') {
//     res.send(200);
//   } else {
//     next();
//   }
// };
