'use strict';

const {requestPromise} = require('../util/request');

const {asyncTimeout} = require('./shared');

describe('newest', () => {
	describe('shockwave-player', () => {
		const entries = [
			{
				source: 'https://fpdownload.macromedia.com/get/shockwave/cabs/director/sw.cab',
				size: 1291232,
				lastModified: 'Tue, 12 Jun 2018 05:27:49 GMT',
				eTag: '"13b3e0-56e6b20832b0a"'
			},
			{
				source: 'https://fpdownload.macromedia.com/get/shockwave/default/english/win95nt/latest/Shockwave_Installer_Full.exe',
				size: 15124520,
				lastModified: 'Tue, 12 Jun 2018 05:27:57 GMT',
				eTag: '"e6c828-56e6b20fc3795"'
			},
			{
				source: 'https://fpdownload.macromedia.com/get/shockwave/default/english/win95nt/latest/sw_lic_full_installer.exe',
				size: 13126968,
				lastModified: 'Tue, 12 Jun 2018 05:27:58 GMT',
				eTag: '"c84d38-56e6b2109ce97"'
			},
			{
				source: 'https://fpdownload.macromedia.com/get/shockwave/default/english/win95nt/latest/sw_lic_full_installer.msi',
				size: 24260096,
				lastModified: 'Tue, 12 Jun 2018 05:27:25 GMT',
				eTag: '"1722e00-56e6b1f17edee"'
			},
			{
				source: 'https://fpdownload.macromedia.com/get/shockwave/default/english/win95nt/latest/Shockwave_Installer_Slim.exe',
				size: 6256864,
				lastModified: 'Tue, 12 Jun 2018 05:27:55 GMT',
				eTag: '"5f78e0-56e6b20d70073"'
			},
			{
				source: 'https://fpdownload.macromedia.com/get/shockwave/default/english/win95nt/latest/sw_lic_slim_installer.exe',
				size: 4262944,
				lastModified: 'Tue, 12 Jun 2018 05:27:55 GMT',
				eTag: '"410c20-56e6b20dc0c93"'
			},
			{
				source: 'https://fpdownload.macromedia.com/get/shockwave/default/english/macosx/latest/Shockwave_Installer_Full_64bit.dmg',
				size: 18771823,
				lastModified: 'Thu, 29 Sep 2016 10:27:21 GMT',
				eTag: '"11e6f6f-53da2ec48cdf6"'
			},
			{
				source: 'https://fpdownload.macromedia.com/get/shockwave/default/english/macosx/latest/Shockwave_Installer_Full.dmg',
				size: 22513907,
				lastModified: 'Thu, 04 Oct 2012 18:22:08 GMT',
				eTag: '"15788f3-4cb3fd5409400"'
			},
			{
				source: 'https://fpdownload.macromedia.com/get/shockwave/default/english/macosx/latest/Shockwave_Installer_Slim.dmg',
				size: 3888494,
				lastModified: 'Thu, 04 Oct 2012 18:22:26 GMT',
				eTag: '"3b556e-4cb3fd6533c80"'
			}
		];
		for (const entry of entries) {
			it(entry.source, async () => {
				const {response} = await requestPromise({
					method: 'HEAD',
					url: entry.source,
					followRedirect: false
				});

				expect(response.statusCode).toBe(200);

				const contentLength = +response.headers['content-length'];
				const lastModified = response.headers['last-modified'];
				const eTag = response.headers.etag;

				expect(contentLength).toBe(entry.size);
				expect(lastModified).toBe(entry.lastModified);
				expect(eTag).toBe(entry.eTag);
			}, asyncTimeout);
		}
	});
});