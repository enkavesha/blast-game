const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const createVariants = require('parallel-webpack').createVariants;

const name = 'blast-game';
const version = '1';
const subVersion = '0';
const templates = ['template'];
const variants = {
    lang: ['en']
};

const pug = {
    test: /.pug$/,
    exclude: ['/node_modules/'],
    use: [
        {
            loader: 'ejs-loader'
        },
        {
            loader: 'pug-html-loader'
        },
    ]
};

function createConfig() {
    var fileName;
    return {
        entry: './templates/app.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].bundle.js'
        },
        module: {
            rules: [pug]
        },
        plugins: [
            ...templates.map(() => {
                fileName = name + '-v' + version + '.' + subVersion;
                return new HtmlWebpackPlugin({
                    filename: fileName + '.html',
                    template: 'templates/variations/content.pug',
                    minify: true,
                    inject: false,
                })
            }),

            new FileManagerPlugin({
                onStart: {
                    delete: ['dist/*']
                },
            }),
        ]
    }
}

module.exports = createVariants(variants, createConfig);