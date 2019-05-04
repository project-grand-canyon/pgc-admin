import { districtsConstants } from '../_constants';
import { districtsService } from '../_services';

export const districtsActions = {
    refresh,
    select
};

function refresh() {
    return dispatch => {
        dispatch(request());
        districtsService.refresh()
            .then(
                districts => { 
                    dispatch(success(districts));
                },
                error => {
                    dispatch(failure(error.toString()));
                }
            );
    };

    function request() { return { type: districtsConstants.REQUEST } }
    function success(districts) { return { type: districtsConstants.SUCCESS, districts } }
    function failure(error) { return { type: districtsConstants.FAILURE, error } }    
}

function select(district) {
    return dispatch => {
        dispatch(select(district));
    };

    function select(district) { return { type: districtsConstants.SELECT, district } }    
}