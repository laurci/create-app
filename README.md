# @laurci/create-app

Quickly scaffold applications from my selection of templates.

```sh
yarn create @laurci/app <template> <name> [path]
```

Templates are loaded from `github.com/$APP_GITHUB_USER/app-template-<template>`, where `<template>` is the argument specified and `$APP_GITHUB_USER` is an environment variable that defaults to my GitHub username (`laurci`).
