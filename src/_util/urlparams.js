const getUrlParameter = (params, name) => {
    name = name.replace(/[[]/, '\\[')
    name = name.replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(params);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

export default getUrlParameter;