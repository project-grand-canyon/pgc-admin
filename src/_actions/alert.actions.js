import { alertConstants } from '../_constants';

export const alertActions = {
    success,
    error,
    clear
};

function success(message) {
    console.log('alert action: success');
    return { type: alertConstants.SUCCESS, message };
}

function error(message) {
    console.log('alert action: error');
    return { type: alertConstants.ERROR, message };
}

function clear() {
    console.log('alert action: clear');
    return { type: alertConstants.CLEAR };
}