import { HttpStatus } from "@nestjs/common"

export const MyNotFoundError = {
  statusCode: HttpStatus.NOT_FOUND,
  message: 'Not Found'
}

export const MyInternalServerError = {
  statusCode: HttpStatus.BAD_GATEWAY,
  message: 'DataBase Error'
}

export const MyConflictError = {
  statusCode: HttpStatus.CONFLICT,
  message: 'Already Exist'
}