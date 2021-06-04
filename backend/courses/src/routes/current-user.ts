import express, { Request, Response, NextFunction } from 'express';

import { currentUser, requireAuth } from '@otmilms/common';

const router = express.Router();

router.get(
  '/api/users/currentuser',
  // (req, res, next) => {
  //   console.log(req);
  //   next();
  // },
  currentUser,
  requireAuth,
  (req: Request, res: Response, next: NextFunction) => {
    res.send({ currentUser: req.currentUser || null });
    // next();
  }
);

export { router as currentUserRouter };
