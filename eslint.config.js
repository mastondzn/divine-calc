import { maston } from '@mastondzn/eslint';

export default maston({
    typescript: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
    },

    tailwindcss: {
        entryPoint: 'src/index.css',
    },

    node: false,

    rules: {
        'ts/no-non-null-assertion': 'warn',
    },
});
