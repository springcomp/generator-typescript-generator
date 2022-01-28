#!/bin/bash

clear_package_json(){
  npx shx cp package.json ./dist/
}

copy_boilerplate_files(){
  npx mkdirp ./dist/
  files=("LICENSE" "README.md")
  for f in "${files[@]}"
  do
  	printf "\e[1;36mCopying boilerplate '$f' file...\n\e[0m"
    npx shx cp $f ./dist/
  done

}

copy_template_files(){
  npx mkdirp ./dist/
  modules=("app")
  for m in "${modules[@]}"
  do
  	printf "\e[1;36mCopying '$m' module template files...\n\e[0m"
    copy_templates $m
  done
}

copy_static_files(){
  npx copyfiles generators/**/**/*.ts ./dist/generators/app/templates/
}

## copy template files from given module
## e.g copy_templates "app"
copy_templates(){
	module=$1
	npx copyfiles -u 2 generators/$1/templates/**/**/* ./dist/generators/$1/templates/
}

typescript(){
  printf "\e[1;36mCompiling TypeScript files...\n\e[0m"
  npx tsc --project . --outDir ./dist/generators/
}

build(){
  typescript
  clear_package_json
  copy_boilerplate_files
  copy_static_files
  copy_template_files
}

build 