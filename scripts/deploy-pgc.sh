# build the site
npm run build

# remove previous site

aws s3 rm s3://admin.projectgrandcanyon.com  --recursive  --profile pgc-admin-ci

# copy the build directory

aws s3 cp build/ s3://admin.projectgrandcanyon.com/ --recursive --profile pgc-admin-ci