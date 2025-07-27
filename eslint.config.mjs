// 这个文件是 ESLint 的配置文件，主要用于配置代码的静态检查规则。
// 这里使用了 @ourongxing/eslint-config 提供的 ourongxing 和 react 配置。
// 主要作用：
// 1. 设定 type 为 "app"，指定项目类型。
// 2. ignores 字段用于排除不需要 ESLint 检查的文件和目录，比如自动生成的文件、配置文件、public 目录等。
// 3. 通过 append 方法为 src 目录下的所有文件应用 react 相关的 ESLint 规则。

// import { ourongxing, react } from "@ourongxing/eslint-config"

// export default ourongxing({
//   type: "app",
//   // 貌似不能 ./ 开头，
//   ignores: ["src/routeTree.gen.ts", "imports.app.d.ts", "public/", ".vscode", "**/*.json"],
// }).append(react({
//   files: ["src/**"],
// }))

// 报错原因：
// 报错内容为：The inferred type of 'default' cannot be named without a reference to '.pnpm/eslint-flat-config-utils@0.4.0/node_modules/eslint-flat-config-utils'. This is likely not portable. A type annotation is necessary.
// 这是 TypeScript 在推断 export default 的类型时，发现类型引用了 node_modules 里的内部类型，导致类型信息无法被正确导出或在其他地方引用。
// 解决方法：
// 1. 这是类型推断相关的警告，通常不会影响实际 ESLint 配置的运行。如果只是用作 ESLint 配置文件，可以忽略。
// 2. 如果想消除警告，可以为 export default 显式添加类型注解，或者将该文件后缀改为 .cjs（纯 JS），避免类型推断。
// 3. 也可以在 tsconfig.json 里关闭相关类型检查（如 "isolatedModules": false），但一般不推荐。
