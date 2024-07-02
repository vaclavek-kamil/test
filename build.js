const { execSync } = require("child_process");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const defaultSource = "main";
const testTargets = ["test1", "test2"];
const productionTargets = ["prod1", "prod2"];
const ignoredPaths = [
  "config.json",
  "build.js",
  "node_modules",
  "package.json",
  "package-lock.json",
];

const argv = yargs(hideBin(process.argv))
  .option("source", {
    alias: "s",
    type: "string",
    description: "Source branch to merge from",
    default: defaultSource,
  })
  .option("production", {
    alias: "p",
    type: "boolean",
    description: "This flag causes the merge to go into production branches",
    default: false,
  })
  .help().argv;

const runCommand = (command) => {
  try {
    const output = execSync(command, { stdio: "inherit" });
    console.log("output: ", output);
    return output ? output.toString() : undefined;
  } catch (error) {
    console.log(error);
    console.error(`Error executing command: ${command}`);
    process.exit(1);
  }
};

const mergeBranch = (sourceBranch, targetBranch) => {
  console.log(`Merging ${sourceBranch} into ${targetBranch}...`);

  runCommand(`git checkout ${targetBranch}`);
  runCommand(`git pull origin ${targetBranch}`);
  runCommand(`git merge ${sourceBranch}`);

  // Reset changes in the specified file and directory
  ignoredPaths.forEach((path) => {
    console.log(`Resetting changes in ignored path: ${path}`);
    runCommand(`git checkout -- ${path}`);
  });

  runCommand(`git push origin ${targetBranch}`);

  console.log(`Successfully merged ${sourceBranch} into ${targetBranch}`);
};

const main = () => {
  const sourceBranch = argv.source;
  const targetBranches = argv.production ? productionTargets : testTargets;

  targetBranches.forEach((targetBranch) => {
    mergeBranch(sourceBranch, targetBranch);
  });

  console.log("All branches merged successfully!");
};

main();
