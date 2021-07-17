import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '@otmilms/common';
import { User } from '../models/models';

export const getUserRole = catchAsync(async (req: Request, res: Response) => {
  let userId: string = '';
  if (req.currentUser) {
    userId = req.currentUser.id;
    const examinedUser = await User.findById(userId);
    let userRole: string | undefined;

    if (examinedUser) {
      userRole = examinedUser.role;
    }

    res.status(200).json({
      message: 'User role fetched successfully',
      userRole,
    });
  } else {
  }
});
