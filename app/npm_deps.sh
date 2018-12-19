#!/bin/sh
NPM=../bin/npm

$NPM init -f
$NPM install koa
$NPM install koa-route
$NPM install koa-websocket
$NPM install log4js