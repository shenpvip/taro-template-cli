#!/usr/bin/env node

const program = require("commander")
const initAction = require("./init")
program.command("init").description("创建新项目").action(initAction)

program.version(
  require("./package.json").version,
  "-v,-V,--version",
  "查看版本号"
)
program.parse(process.argv)
