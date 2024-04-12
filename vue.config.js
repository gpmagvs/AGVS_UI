const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
<<<<<<< HEAD
  outputDir: 'dist',
  runtimeCompiler: true,
=======
  outputDir: '../GPMVehicleControlSystem/GPMVehicleControlSystem/wwwroot',
  configureWebpack: {
    devtool: 'source-map'
  }
>>>>>>> ae44f2291e3361fe9e9cbc8a15ef35f6dcc8c6c7
})
