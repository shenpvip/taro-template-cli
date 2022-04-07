const shell = require("shelljs")
const symbols = require("log-symbols") // 命令行图标
const clone = require("./clone.js")
const remote = "https://github.com/shenpvip/taro-template.git"
const fs = require("fs")
const ora = require("ora") // 用于输出loading
const chalk = require("chalk") // 用于改变文字颜色
const path = require("path")
const inquirer = require("inquirer") // 用于命令行和用户交互
const notifier = require("node-notifier")
let branch = "main"

const initAction = async () => {
  console.log(`version: ${require("./package.json").version}\n`)
  console.log(chalk.greenBright("您即将创建一个新项目!\n"))

  // 定义需要询问的问题
  const questions = [
    {
      type: "input",
      message: "请输入模板名称:",
      name: "name",
      validate(val) {
        if (!val) return "模板名称不能为空！"
        if (val.match(/[^A-Za-z0-9\u4e00-\u9fa5_-]/g))
          return "模板名称包含非法字符，请重新输入"
        return true
      },
    },
    {
      type: "input",
      message: "请输入模板简介:",
      name: "description",
    },
  ]
  // 通过inquirer获取到用户输入的内容
  const answers = await inquirer.prompt(questions)
  let confirm = await inquirer.prompt([
    {
      type: "confirm",
      message: "确认创建？",
      default: "Y",
      name: "isConfirm",
    },
  ])
  if (!confirm.isConfirm) return false

  // 下载模板
  await clone(`direct:${remote}#${branch}`, answers.name, { clone: true })
  try {
    //根据用户配置调整文件
    let packageJson = fs.readFileSync(
      (path.join(__dirname, "./"), `${answers.name}/package.json`),
      function (err, data) {
        console.log(err)
      }
    )
    let projectJson = fs.readFileSync(
      (path.join(__dirname, "./"), `${answers.name}/project.config.json`),
      function (err, data) {
        console.log(err)
      }
    )
    packageJson = JSON.parse(packageJson)
    projectJson = JSON.parse(projectJson)
    packageJson["name"] = answers.name
    packageJson["description"] = answers.description
    projectJson["projectname"] = answers.name
    projectJson["description"] = answers.description

    const packageObj = JSON.stringify(packageJson, null, "\t")
    const projectObj = JSON.stringify(packageJson, null, "\t")

    fs.writeFileSync(
      (path.join(__dirname, "./"), `${answers.name}/package.json`),
      packageObj,
      function (err, data) {
        console.log(err, data)
      }
    )
    fs.writeFileSync(
      (path.join(__dirname, "./"), `${answers.name}/project.config.json`),
      projectObj,
      function (err, data) {
        console.log(err, data)
      }
    )
  } catch (error) {}

  //自动安装依赖
  console.log(symbols.success, `cd ${chalk.cyanBright(answers.name)} \n`)
  await shell.cd(`${answers.name}`)
  const installSpinner = ora(
    `执行安装项目依赖 ${chalk.cyanBright("yarn install")}, 需要一会儿...\n`
  ).start()
  if (shell.exec("yarn install").code !== 0) {
    console.log(symbols.warning, chalk.yellow("自动安装失败，请手动安装！"))
    installSpinner.fail() // 安装失败
    shell.exit(1)
  }
  installSpinner.succeed(chalk.green("依赖安装成功！"))
  //切入后台的时候给用户提示
  notifier.notify({
    title: "taro-template-cli",
    icon: path.join(__dirname, "coulson.png"),
    message: " ♪(＾∀＾●)ﾉ 恭喜，项目创建成功！",
  })
  //打开编辑器
  if (shell.which("code")) shell.exec("code ./")
  shell.exit(1)
}
module.exports = initAction
