#!/bin/bash -e

NAME=feeds
SCHEME=$NAME
TARGET=archive
if [ "$1" != "" ]; then
    SCHEME="$1"
    shift
    TARGET="$*"
fi

# shellcheck disable=SC2086
(cd ios && xcodebuild -workspace $NAME.xcworkspace -allowProvisioningUpdates -scheme $SCHEME $TARGET)
