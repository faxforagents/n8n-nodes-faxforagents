// The node is declarative: every operation is a routing entry over the REST API. These tests
// read the built description and check it against the API the hosted MCP server wraps, with no
// network at all. A live send is never part of the suite.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { FaxForAgents } = require('../dist/nodes/FaxForAgents/FaxForAgents.node.js');
const { FaxForAgentsApi } = require('../dist/credentials/FaxForAgentsApi.credentials.js');
const pkg = require('../package.json');

const description = new FaxForAgents().description;
const props = description.properties;

function options(resource) {
	const op = props.find((p) => p.name === 'operation' && p.displayOptions.show.resource[0] === resource);
	assert.ok(op, `operation selector for ${resource}`);
	return Object.fromEntries(op.options.map((o) => [o.value, o]));
}

test('the package follows the community node rules', () => {
	assert.ok(pkg.name.startsWith('n8n-nodes-'));
	assert.ok(pkg.keywords.includes('n8n-community-node-package'));
	assert.equal(pkg.license, 'MIT');
	assert.equal(pkg.dependencies, undefined, 'no runtime dependencies');
	assert.deepEqual(pkg.n8n.nodes, ['dist/nodes/FaxForAgents/FaxForAgents.node.js']);
	assert.deepEqual(pkg.n8n.credentials, ['dist/credentials/FaxForAgentsApi.credentials.js']);
});

test('the credential sends the key as a bearer token and tests it on /v1/me', () => {
	const cred = new FaxForAgentsApi();
	assert.equal(cred.name, 'faxForAgentsApi');
	assert.equal(cred.properties[0].typeOptions.password, true);
	assert.equal(cred.authenticate.properties.headers.Authorization, '=Bearer {{$credentials.apiKey}}');
	assert.equal(cred.test.request.baseURL, 'https://api.faxforagents.com');
	assert.equal(cred.test.request.url, '/v1/me');
});

test('the node talks to api.faxforagents.com and can be an agent tool', () => {
	assert.equal(description.requestDefaults.baseURL, 'https://api.faxforagents.com');
	assert.equal(description.usableAsTool, true);
	assert.deepEqual(description.credentials, [{ name: 'faxForAgentsApi', required: true }]);
});

test('the operations map to the REST endpoints', () => {
	const doc = options('document');
	assert.deepEqual(doc.prepare.routing.request, { method: 'POST', url: '/v1/documents' });
	assert.deepEqual(doc.get.routing.request, { method: 'GET', url: '=/v1/documents/{{ $parameter.documentId }}' });

	const fax = options('fax');
	assert.deepEqual(fax.quote.routing.request, { method: 'POST', url: '/v1/fax-quotes' });
	assert.equal(fax.send.routing.request.method, 'POST');
	assert.equal(fax.send.routing.request.url, '/v1/faxes');
	assert.match(fax.send.routing.request.headers['Idempotency-Key'], /\$parameter\.quoteId/);
	assert.deepEqual(fax.get.routing.request, { method: 'GET', url: '=/v1/faxes/{{ $parameter.faxId }}' });
	assert.deepEqual(fax.getAll.routing.request, { method: 'GET', url: '/v1/faxes' });
	assert.deepEqual(fax.cancel.routing.request, { method: 'POST', url: '=/v1/faxes/{{ $parameter.faxId }}/cancel' });

	const inbox = options('inbox');
	assert.deepEqual(inbox.get.routing.request, { method: 'GET', url: '=/v1/inbox/{{ $parameter.inboxId }}' });
	assert.deepEqual(inbox.getAll.routing.request, { method: 'GET', url: '/v1/inbox' });
});

test('the request bodies use the API field names', () => {
	const bodyField = (name) => props.find((p) => p.name === name && p.routing?.send).routing.send.property;
	assert.equal(bodyField('documentId'), 'document_id');
	assert.equal(bodyField('to'), 'to');
	assert.equal(bodyField('quoteId'), 'quote_id');
	assert.equal(bodyField('approvalId'), 'approval_id');
	assert.equal(bodyField('clientReference'), 'client_reference');
	assert.equal(bodyField('uploadId'), 'upload_id');
});

test('Get Many follows next_cursor and splits items', () => {
	const returnAll = props.filter((p) => p.name === 'returnAll');
	assert.equal(returnAll.length, 2);
	for (const p of returnAll) {
		const pagination = p.routing.operations.pagination.properties;
		assert.equal(pagination.continue, '={{ !!$response.body.next_cursor }}');
		assert.equal(pagination.request.qs.cursor, '={{ $response.body.next_cursor }}');
	}
	for (const resource of ['fax', 'inbox']) {
		const post = options(resource).getAll.routing.output.postReceive[0];
		assert.deepEqual(post, { type: 'rootProperty', properties: { property: 'items' } });
	}
});

test('the built code touches neither the environment nor the file system', () => {
	for (const file of [...pkg.n8n.nodes, ...pkg.n8n.credentials]) {
		const src = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
		assert.doesNotMatch(src, /process\.env|require\(["']fs["']\)|require\(["']node:fs["']\)/);
	}
});
