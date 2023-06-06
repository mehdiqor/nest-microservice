import { HttpStatus } from '@nestjs/common';

export const MyNotFoundError = function (arg: string) {
  return {
    statusCode: HttpStatus.NOT_FOUND,
    message: `${arg} NotFound`,
  };
};

export const MyInternalServerError = function (arg: string) {
  return {
    statusCode: HttpStatus.BAD_GATEWAY,
    message: `${arg} Error`,
  };
};

export const MyConflictError = function (arg: string) {
  return {
    statusCode: HttpStatus.CONFLICT,
    message: `${arg} is Already Exist`,
  };
};
