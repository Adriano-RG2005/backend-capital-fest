import { StatusCodes } from 'http-status-codes';
import HttpException from './HttpException';

export default class NotFoundException extends HttpException {
  constructor(message = 'Not found') {
    super(StatusCodes.NOT_FOUND, message);
  }
}
