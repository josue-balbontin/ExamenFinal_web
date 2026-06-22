export default {
  plugins: {
    'postcss-preset-env': {},
    autoprefixer: {},
    cssnano: process.env.NODE_ENV === 'production' ? {} : false,
  },
};
