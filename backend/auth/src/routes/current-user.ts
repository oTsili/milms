import express from 'express';
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
  (req, res) => {
    res.send({ currentUser: req.currentUser || null });
  }
);

export { router as currentUserRouter };
