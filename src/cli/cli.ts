
import { Version, BuildNumber } from '../Version';
import { Debug } from '../helpers/Debug';
import { parseArguments, addOption } from './cliParser';
import { output, setOutput } from './cliHelpers';
import { RSSFeedManager } from '../helpers/RSSPostManager';
import * as urlUtils from '../helpers/urlUtils';
import { fetchOpenGraphData } from '../helpers/openGraph';
import { fetchHtmlMetaData } from '../helpers/htmlMetaData';
import { fetchAndImportOpml } from '../helpers/opmlImport';
import { fetchFeedsFromUrl } from '../helpers/feedHelpers';

// tslint:disable-next-line:no-var-requires
const fetch = require('node-fetch');
// tslint:disable-next-line:no-var-requires
const FormData = require('form-data');
// tslint:disable-next-line:no-var-requires
const fs = require('fs');

declare var process: {
    argv: string[];
    env: any;
};
declare var global: any;

global.__DEV__ = true;
global.fetch = fetch;
global.FormData = FormData;

Debug.setDebugMode(false);
Debug.showTimestamp = true;

const definitions =
    addOption('-q, --quiet', 'quiet mode', () => setOutput(() => {}))
    .
    addOption('-v, --verbose', 'verbose mode', () => Debug.setDebugMode(true))
    .
    addOption('-n, --no-colors', 'no colors in output', () => Debug.useColors = false)
    .
    addCommand('version', 'Print app version', () => output(Version))
    .
    addCommand('buildNumber', 'Print app build number', () => output(BuildNumber))
    .
    addCommand('test [name]', 'Run integration tests', async (testName) => {
            const allTests: any = {
            };
            if (process.env.SWARM_GATEWAY != null) {
                output('Running with SWARM at', process.env.SWARM_GATEWAY);
            }
            if (testName == null) {
                for (const test of Object.keys(allTests)) {
                    output('Running test:', test);
                    await allTests[test]();
                    if (Debug.isDebugMode) {
                        output('Finished test:', test, '\n\n');
                    }
                }
                output(`${Object.keys(allTests).length} tests passed succesfully`);
            } else {
                const test = allTests[testName];
                output('\nRunning test: ', testName);
                await test();
            }
    })
    .addCommand('bugreport [endpoint]', 'Send bugreport to endpoint', async (endpoint) => {
    })
    .
    addCommand('rss <url>', 'Fetch RSS feed of url', async (url: string) => {
        const canonicalUrl = urlUtils.getCanonicalUrl(url);
        const feed = await RSSFeedManager.fetchFeedFromUrl(canonicalUrl);
        output('rss feed', {feed});
    })
    .
    addCommand('opengraph <url>', 'Fetch OpenGraph data of url', async (url: string) => {
        const canonicalUrl = urlUtils.getCanonicalUrl(url);
        const data = await fetchOpenGraphData(canonicalUrl);
        output({data});
    })
    .
    addCommand('metadata <url>', 'Fetch metadata of url', async (url: string) => {
        const canonicalUrl = urlUtils.getCanonicalUrl(url);
        const data = await fetchHtmlMetaData(canonicalUrl);
        output({data});
    })
    .
    addCommand('checkversions', 'Check package.json versions', async () => {
        const packageJSON = JSON.parse(fs.readFileSync('package.json'));
        checkVersions(packageJSON.dependencies);
        checkVersions(packageJSON.devDependencies);
    })
    .
    addCommand('opml <url>', 'Download and conver OPML data', async (url: string) => {
        const data = await fetchAndImportOpml(url);
        output({data});
    })
    .
    addCommand('addFeed <url>', 'Test add feed input', async (url: string) => {
        const feeds = await fetchFeedsFromUrl(url);
        output({feeds});
    })
;

const checkVersions = (deps: {[pack: string]: string}) => {
    const errors = [];
    for (const key of Object.keys(deps)) {
        const version = deps[key];
        if (!version.substring(0, 1).match(/[0-9]/)) {
            errors.push(`${key}: ${version}`);
        }
    }
    if (errors.length > 0) {
        // tslint:disable-next-line: no-console
        output(errors);
        output('Fix the versions by specifying exact versions instead of ranges');
        throw new Error('invalid versions');
    }
};

parseArguments(process.argv, definitions, output, output);
