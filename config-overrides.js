const { injectBabelPlugin } = require('react-app-rewired');
const rewireLess = require('react-app-rewire-less');

// Helpful reference
// https://github.com/andriijas/monkey-admin/blob/master/config-overrides.js

module.exports = function override(config, env) {
    config = injectBabelPlugin(
        ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
        config,
        );

    config = rewireLess.withLoaderOptions({
        modifyVars: {
            "@primary-color": "#1698d9",
            "@font-size-base": "16px",
            "@font-size-sm" : "14px"
        },
        javascriptEnabled: true,
    })(config, env);
    return config;
  };