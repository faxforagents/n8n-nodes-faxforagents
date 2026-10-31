import type { INodeProperties } from 'n8n-workflow';

import { itemsOutput, pagedFields } from './shared';

const showOnlyForFaxes = {
	resource: ['fax'],
};

const showOnlyForQuote = {
	resource: ['fax'],
	operation: ['quote'],
};

const showOnlyForSend = {
	resource: ['fax'],
	operation: ['send'],
};

const showOnlyForGetMany = {
	resource: ['fax'],
	operation: ['getAll'],
};

export const faxOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForFaxes,
		},
		options: [
			{
				name: 'Quote',
				value: 'quote',
				action: 'Quote a fax',
				description:
					'The exact price of one document to one destination, valid ten minutes, with whether a human approval is required. Nothing is sent.',
				routing: {
					request: {
						method: 'POST',
						url: '/v1/fax-quotes',
					},
				},
			},
			{
				name: 'Send',
				value: 'send',
				action: 'Send a quoted fax',
				description:
					'Queue a quoted fax. The answer is queued, never delivered: read the status afterwards.',
				routing: {
					request: {
						method: 'POST',
						url: '/v1/faxes',
						headers: {
							'Idempotency-Key': '={{ $parameter.idempotencyKey || "n8n:" + $parameter.quoteId }}',
						},
					},
				},
			},
			{
				name: 'Get Status',
				value: 'get',
				action: 'Get the status of a fax',
				description:
					'The state of one fax: queued, active, delivered, partial, failed or unknown, with the carrier evidence once delivered',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/faxes/{{ $parameter.faxId }}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many faxes',
				description: 'Sent faxes of the organization, newest first',
				routing: {
					request: {
						method: 'GET',
						url: '/v1/faxes',
					},
					...itemsOutput,
				},
			},
			{
				name: 'Cancel',
				value: 'cancel',
				action: 'Cancel a fax',
				description: 'Cancel a fax while it is queued, best effort once it is sending',
				routing: {
					request: {
						method: 'POST',
						url: '=/v1/faxes/{{ $parameter.faxId }}/cancel',
					},
				},
			},
		],
		default: 'send',
	},
];

export const faxFields: INodeProperties[] = [
	{
		displayName: 'Document ID',
		name: 'documentId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForQuote,
		},
		description: 'The document to send, as returned by Prepare',
		routing: {
			send: {
				type: 'body',
				property: 'document_id',
			},
		},
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'string',
		default: '',
		required: true,
		placeholder: '+12025550123',
		displayOptions: {
			show: showOnlyForQuote,
		},
		description:
			'The destination in E.164. With a test key, +15550000001 is delivered, +15550000003 is partial and +15550000005 is unknown.',
		routing: {
			send: {
				type: 'body',
				property: 'to',
			},
		},
	},
	{
		displayName: 'Cover Sheet',
		name: 'cover',
		type: 'collection',
		placeholder: 'Add Cover Field',
		default: {},
		displayOptions: {
			show: showOnlyForQuote,
		},
		description: 'A cover sheet in front of the document. It counts as a billable page.',
		options: [
			{
				displayName: 'To Name',
				name: 'to_name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'From Name',
				name: 'from_name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				default: '',
			},
		],
		routing: {
			send: {
				type: 'body',
				property: 'cover',
				value: '={{ Object.keys($value).length ? $value : undefined }}',
			},
		},
	},
	{
		displayName: 'From',
		name: 'from',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForQuote,
		},
		description: 'A number you own, in E.164. Leave empty for the shared pool.',
		routing: {
			send: {
				type: 'body',
				property: 'from',
				value: '={{ $value || undefined }}',
			},
		},
	},
	{
		displayName: 'Quote ID',
		name: 'quoteId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForSend,
		},
		description: 'The quote to send, as returned by Quote. A quote is valid ten minutes.',
		routing: {
			send: {
				type: 'body',
				property: 'quote_id',
			},
		},
	},
	{
		displayName: 'Approval ID',
		name: 'approvalId',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForSend,
		},
		description:
			'An approved request bound to this quote, when the quote says a human approval is required. A person approves it in the dashboard.',
		routing: {
			send: {
				type: 'body',
				property: 'approval_id',
				value: '={{ $value || undefined }}',
			},
		},
	},
	{
		displayName: 'Client Reference',
		name: 'clientReference',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForSend,
		},
		description: 'Your own reference for this fax, up to 200 characters',
		routing: {
			send: {
				type: 'body',
				property: 'client_reference',
				value: '={{ $value || undefined }}',
			},
		},
	},
	{
		displayName: 'Idempotency Key',
		name: 'idempotencyKey',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForSend,
		},
		description:
			'Repeating a send with the same key returns the same fax instead of a second one. Empty means n8n: followed by the quote ID.',
	},
	{
		displayName: 'Fax ID',
		name: 'faxId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['fax'],
				operation: ['get', 'cancel'],
			},
		},
		description: 'The fax ID, fax_ followed by 32 hex characters',
	},
	...pagedFields(showOnlyForGetMany),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: showOnlyForGetMany,
		},
		options: [
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Delivered', value: 'delivered' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Partial', value: 'partial' },
					{ name: 'Queued', value: 'queued' },
					{ name: 'Unknown', value: 'unknown' },
				],
				default: 'delivered',
				routing: {
					send: {
						type: 'query',
						property: 'state',
					},
				},
			},
		],
	},
];
