#!/bin/bash

if [ -z "$1" ]; then
    echo "Missing arg"
    exit 1
fi

mkdir $1
FILENAME="$1/$1.js"
CSS_FILENAME="$1/$1.module.css"
touch $FILENAME
touch $CSS_FILENAME

JS_VAR=$(echo "$1" | tr '[:upper:]' '[:lower:]')

echo "import React from 'react';" >> $FILENAME
echo "import styles from './$1.module.css';" >> $FILENAME
echo "" >> $FILENAME
echo "const $JS_VAR = (props) => {" >> $FILENAME
echo "    return ();" >> $FILENAME
echo "};" >> $FILENAME
echo "" >> $FILENAME
echo "export default $JS_VAR;" >> $FILENAME

echo ".$1 {" >> $CSS_FILENAME
echo "}" >> $CSS_FILENAME

exit 0;