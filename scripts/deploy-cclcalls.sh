# build the site
npm run build

# remove previous site

aws s3 rm s3://admin.cclcalls.org  --recursive  --profile cclcalls-admin-ci

# copy the build directory

aws s3 cp build/ s3://admin.cclcalls.org/ --recursive --profile cclcalls-admin-ci