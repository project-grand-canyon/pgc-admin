import { districtsConstants } from '../_constants';
import { districtsService } from '../_services';

export const districtsActions = {
    refresh
};

function refresh() {
    return dispatch => {
        dispatch(request());
        districtsService.refresh()
            .then(
                result => {
                    dispatch(success(result));
                },
                error => {
                    dispatch(failure(error));
                }
            );
    };

    function request() { return { type: districtsConstants.REQUEST } }
    function success(result) { return { type: districtsConstants.SUCCESS, ...result } }
    function failure(error) { return { type: districtsConstants.FAILURE, error } }    
}
