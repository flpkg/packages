#!/usr/bin/env node

/* eslint-disable no-console */
'use strict';

const path = require('path');

const fse = require('fs-extra');

const gencache = require('../util/gencache');
const hash = require('../util/hash');
const yaml = require('../util/yaml');

const packagesDir = path.join(path.dirname(__dirname), 'packages');

async function main() {
	const args = process.argv.slice(2);
	if (args.length < 1) {
		throw new Error('Missing version argument');
	}
	const [version] = args;

	const file = path.join(
		packagesDir,
		'flash-playerglobal',
		`${version}.yaml`
	);

	const versionURL = version.replace(/\./, '_');
	const [versionMajor] = version.split('.');
	const name = `flash-playerglobal-${version}`;
	const url = `https://fpdownload.macromedia.com/get/flashplayer/updaters/${versionMajor}/playerglobal${versionURL}.swc`;

	console.log(`Name: ${name}`);
	console.log(`URL: ${url}`);

	// eslint-disable-next-line no-await-in-loop
	const cached = await gencache.ensure(name, url, progress => {
		const percent = progress * 100;
		process.stdout.write(`\rDownloading: ${percent.toFixed(2)}%\r`);
	});

	if (cached.downloaded) {
		console.log('');
	}
	else {
		console.log('Cached');
	}

	const stat = await fse.stat(cached.filepath);
	const {size} = stat;
	console.log(`Size: ${size}`);

	const [sha256, sha1, md5] =
		await hash.file(cached.filepath, ['sha256', 'sha1', 'md5']);
	console.log(`SHA256: ${sha256}`);
	console.log(`SHA1: ${sha1}`);
	console.log(`MD5: ${md5}`);
	console.log('');

	const doc = [{
		name,
		file: url.split('/').pop(),
		size,
		sha256,
		sha1,
		md5,
		source: url
	}];

	console.log(`Writing: ${file}`);

	const data = yaml.packages(doc);
	await fse.writeFile(file, data, 'utf8');

	console.log('Done');
}
main().catch(err => {
	console.error(err);
	process.exitCode = 1;
});
