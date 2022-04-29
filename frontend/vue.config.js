const webpack = require('webpack')

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
module.exports = {
    publicPath: process.env.PUBLIC_PATH,
    devServer: {
        host: process.env.VUE_APP_DEV_SERVER_HOST,
        port: 8443,
        https: true,
    },

    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({ adapter: ['webrtc-adapter', 'default'] })
        ]
    },

    chainWebpack: config => {
        config.module.rule('janus-gateway')
            .test(require.resolve('janus-gateway'))
            .use('exports-loader')
            .loader('exports-loader')
            .options({exports: 'Janus'})
            .end()
        //config.plugin('adapter').use(new webpack.ProvidePlugin({ adapter: ['webrtc-adapter', 'default'] }))
    }
}