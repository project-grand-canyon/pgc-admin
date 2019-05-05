import { adminConstants } from '../_constants';
import { adminService } from '../_services';

function refresh(username) {
    return dispatch => {
        dispatch(request());
        adminService.refresh(username)
            .then(
                adminDetails => { 
                    dispatch(success(adminDetails));
                },
                error => {
                    dispatch(failure(error.toString()));
                }
            );
    };

    function request() { return { type: adminConstants.REQUEST } }
    function success(admin) { return { type: adminConstants.SUCCESS, admin } }
    function failure(error) { return { type: adminConstants.FAILURE, error } }    
}

function clear() {
    return dispatch => {
        adminService.clear();
        dispatch(clr())
    }
    function clr() { return { type: adminConstants.CLEAR } }
}

const adminActions = {
    refresh,
    clear
};


export { adminActions as adminActions };