#!/usr/bin/env node

/* eslint-disable no-console */
'use strict';

const path = require('path');

const fse = require('fs-extra');

const gencache = require('../util/gencache');
const hash = require('../util/hash');
const zip = require('../util/zip');
const paths = require('../util/paths');
const yaml = require('../util/yaml');

const packagesDir = path.join(__dirname, '..', 'packages');

function pathToName(filepath) {
	return filepath.split('/').pop();
}

function genList(version) {
	const verstr = version
		.split('.')
		.slice(0, 2)
		.join('.');

	return [
		[
			`air-sdk-${version}-windows`,
			`https://fpdownload.macromedia.com/air/win/download/${verstr}/AdobeAIRSDK.zip`
		],
		[
			`air-sdk-${version}-windows-compiler`,
			`https://fpdownload.macromedia.com/air/win/download/${verstr}/AIRSDK_Compiler.zip`
		],
		[
			`air-sdk-${version}-mac`,
			`https://fpdownload.macromedia.com/air/mac/download/${verstr}/AdobeAIRSDK.dmg`
		],
		[
			`air-sdk-${version}-mac-compiler`,
			`https://fpdownload.macromedia.com/air/mac/download/${verstr}/AIRSDK_Compiler.dmg`
		]
	];
}

async function main() {
	const args = process.argv.slice(2);
	if (args.length < 1) {
		throw new Error('Missing version argument');
	}
	const [version] = args;

	const file = path.join(packagesDir, 'air-sdk', `${version}.yaml`);
	const fileExists = await fse.pathExists(file);
	if (fileExists) {
		throw new Error(`Path exists: ${file}`);
	}

	const doc = [];
	const list = genList(version);
	for (const [name, url] of list) {
		console.log(`Name: ${name}`);
		console.log(`URL: ${url}`);

		// eslint-disable-next-line no-await-in-loop
		const cached = await gencache.ensure(name, url, progress => {
			const percent = progress * 100;
			process.stdout.write(`\rDownloading: ${percent.toFixed(2)}%`);
		});
		if (cached.downloaded) {
			console.log('');
		}
		else {
			console.log('Cached');
		}

		// eslint-disable-next-line no-await-in-loop
		const stat = await fse.stat(cached.filepath);
		const {size} = stat;
		console.log(`Size: ${size}`);

		// eslint-disable-next-line no-await-in-loop
		const sha256 = await hash.file(cached.filepath, 'sha256');
		console.log(`SHA256: ${sha256}`);

		const entry = {
			name,
			file: url.split('/').pop(),
			size,
			sha256,
			source: url
		};

		const archiveSuffix = '-archive';
		if (name.endsWith(archiveSuffix)) {
			const nameSub = name.substr(0, name.length - archiveSuffix.length);

			let pkg = null;

			// eslint-disable-next-line no-await-in-loop
			await zip.itterFile(cached.filepath, async info => {
				if (info.isDirector) {
					return;
				}
				const {filepath} = info;
				if (paths.isSystem(filepath) || paths.isMetadata(filepath)) {
					return;
				}
				if (pkg) {
					throw new Error(`Unexpected second entry ${filepath}`);
				}

				const filename = pathToName(filepath);

				console.log(`  Filepath: ${filepath}`);

				const data = await info.read();
				const size = data.length;
				console.log(`  Size: ${size}`);

				const sha256 = await hash.buffer(data, 'sha256');
				console.log(`  SHA256: ${sha256}`);

				console.log(`  Name: ${nameSub}`);

				pkg = {
					name: nameSub,
					file: filename,
					size,
					sha256,
					path: filepath
				};
			});

			entry.packages = [pkg];
		}

		doc.push(entry);

		console.log('');
	}

	console.log(`Writing: ${file}`);

	const data = yaml.packages(doc);
	await fse.writeFile(file, data, 'utf8');

	console.log('Done');
}
main().catch(err => {
	console.error(err);
	process.exitCode = 1;
});
