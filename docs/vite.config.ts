import path from 'path'

export default {
    base: '',
    resolve: {
        alias: {
            '@pages': path.resolve(__dirname, '../Vue/Pages'),
            '@components': path.resolve(__dirname, '../Vue/Components'),
            '@stores': path.resolve(__dirname, '../Vue/Stores'),
            '@public': path.resolve(__dirname, '../public')
        },
    },
}