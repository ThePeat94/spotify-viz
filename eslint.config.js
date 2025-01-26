import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';

export default tseslint.config(
    {ignores: ['dist']},
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked, ...tseslint.configs.stylisticTypeChecked],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                project: ['./tsconfig.node.json', './tsconfig.app.json'],
                tsconfigRootDir: import.meta.dirname,
            }
        },
        settings: {react: {version: '18.3'}},
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            react,
            'no-relative-import-paths': noRelativeImportPaths,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,

            'react-refresh/only-export-components': [
                'warn',
                {allowConstantExport: true},
            ],
            "curly": ["error", "all"],
            "brace-style": ["error", "1tbs"],
            "indent": ["error", 4],
            "object-curly-spacing": ["error", "always"],
            "quotes": ["error", "single"],
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-return": "off",
            "@typescript-eslint/no-base-to-string": "off",
            "@typescript-eslint/consistent-type-definitions": ["error", "type"],
            "react/jsx-key": "warn",
            "no-relative-import-paths/no-relative-import-paths": ["error", { "rootDir": "src" }],
            "no-trailing-spaces": "error",
        },
    },
)
