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

echo "import React, { Component } from 'react';" >> $FILENAME
echo "import styles from './$1.module.css';" >> $FILENAME
echo "" >> $FILENAME
echo "class $1 extends Component {" >> $FILENAME
echo "    render() {" >> $FILENAME
echo "    }" >> $FILENAME
echo "}" >> $FILENAME
echo "" >> $FILENAME
echo "export default $1;" >> $FILENAME

echo ".$1 {" >> $CSS_FILENAME
echo "}" >> $CSS_FILENAME

exit 0;