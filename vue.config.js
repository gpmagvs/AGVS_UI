const { defineConfig } = require('@vue/cli-service');

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = defineConfig({
  devServer: {
    client: {
      overlay: {
        warnings: false, // 控制是否显示警告
        errors: false // 控制是否显示错误
      }
    }
  },
  filenameHashing: true,
  outputDir: '../AGVSystem/wwwroot_beta',
  runtimeCompiler: isDevelopment, // 開發模式為 true，否則為 false
});