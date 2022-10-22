#!/usr/bin/env node

import Path from "path";
import Fs from "fs";
import makeGit from "simple-git";
import rimraf from "rimraf";
import { execSync } from "child_process";

import config from "./config";

interface Arguments {
    template: string;
    path: string;
    name: string;
}

function printUsage() {
    console.log("Usage: yarn create @laurci/app <template> <name> [path]");
    process.exit(1);
}

function parseArguments(): Arguments {
    const args = process.argv.slice(2);
    const template = args[0];
    const name = args[1];
    let relativePath = args[2];

    if (!template || !name) {
        printUsage();
    }

    if (!relativePath) {
        relativePath = `./${name}`;
    }

    const path = Path.join(process.cwd(), relativePath);

    return {
        template,
        path,
        name,
    };
}

function validateArguments(args: Arguments) {
    function validationError(message: string) {
        console.error("Argument Error: " + message);
        process.exit(1);
    }


    if (Fs.existsSync(args.path)) {
        const stat = Fs.statSync(args.path);
        if (!stat.isDirectory()) {
            validationError(`Path ${args.path} exists and is not a directory`);
        }

        const files = Fs.readdirSync(args.path);
        if (files.length > 0) {
            validationError(`Path ${args.path} exists and is not empty. Contents: ${files.join(", ")}`);
        }
    }
}

function ensureDir(path: string) {
    if (!Fs.existsSync(path)) {
        Fs.mkdirSync(path, { recursive: true });
    }
}

function getRepoPath(template: string) {
    return `git@github.com:${config.githubUsername}/app-template-${template}.git`
}

function getGit(path: string) {
    const git = makeGit(path);
    return git;
}

function templatePackageJson(args: Arguments) {
    const currentPackageJson = require(Path.join(args.path, "package.json"));
    const newPackageJson = {
        ...currentPackageJson,
        name: args.name,
    };

    Fs.writeFileSync(Path.join(args.path, "package.json"), JSON.stringify(newPackageJson, null, 4));
}

function printNextSteps(args: Arguments) {
    console.log(`
Done!
Next steps:

1. cd ${Path.relative(process.cwd(), args.path)}
2. code .
3. Do something awesome!
`);
}

async function main() {
    const args = parseArguments();
    validateArguments(args);
    ensureDir(args.path);

    console.log(`Using directory ${args.path}`);

    const git = getGit(args.path);

    const repo = getRepoPath(args.template);

    console.log(`Cloning template... [${repo}]`);
    await git.clone(repo, args.path);

    console.log("Wiping git history...");
    rimraf.sync(Path.join(args.path, ".git"));

    console.log("Initializing new git repository...");
    await git.init();

    templatePackageJson(args);

    console.log("Installing dependencies...");
    execSync("yarn", { cwd: args.path, stdio: "inherit" });

    printNextSteps(args);
}


function reportError(error: Error) {
    console.log(`${error.name}: ${error.message}`);

    process.exit(1);
}

main().catch(reportError);