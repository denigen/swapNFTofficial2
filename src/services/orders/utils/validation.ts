import { isValidAddress } from '../../../utils/addressUtils';
import { ORDER_SERVICE_ERRORS } from '../constants/errors';

export function validateOrderServiceParams(address: string | null | undefined): void {
  if (!address) {
    throw new Error(ORDER_SERVICE_ERRORS.INVALID_ADDRESS);
  }

  if (!isValidAddress(address)) {
    throw new Error(ORDER_SERVICE_ERRORS.INVALID_ADDRESS);
  }
}

export function validateInitialization(isInitialized: boolean): void {
  if (!isInitialized) {
    throw new Error(ORDER_SERVICE_ERRORS.NOT_INITIALIZED);
  }
}