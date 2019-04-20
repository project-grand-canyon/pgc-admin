import { districtsConstants } from '../_constants';
import { districtsService } from '../_services';

export const districtsActions = {
    refresh,
    select
};

function refresh() {
    console.log('districts action: refresh');
    return dispatch => {
        console.log('districts action refresh dispatch request');
        dispatch(request());
        console.log('districts action refresh districts service refresh');
        districtsService.refresh()
            .then(
                districts => { 
                    console.log('districts action refresh dispatch success ');
                    console.log(districts);
                    dispatch(success(districts));
                },
                error => {
                    console.log(JSON.stringify(error));
                    console.log('districts action refresh dispatch failure');
                    dispatch(failure(error.toString()));
                }
            );
    };

    function request() { return { type: districtsConstants.REQUEST } }
    function success(districts) { return { type: districtsConstants.SUCCESS, districts } }
    function failure(error) { return { type: districtsConstants.FAILURE, error } }    
}

function select(district) {
    console.log('districts action: select');
    console.log(district);
    return dispatch => {
        console.log('districts action select dispatch request');
        dispatch(select(district));
    };

    function select(district) { return { type: districtsConstants.SELECT, district } }    
}