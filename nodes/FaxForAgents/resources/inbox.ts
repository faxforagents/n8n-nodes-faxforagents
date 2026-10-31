import type { INodeProperties } from 'n8n-workflow';

import { itemsOutput, pagedFields } from './shared';

const showOnlyForInbox = {
	resource: ['inbox'],
};

const showOnlyForGetMany = {
	resource: ['inbox'],
	operation: ['getAll'],
};

export const inboxOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForInbox,
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Read a received fax',
				description:
					'One received fax with its text as data. The sender header and the text come from whoever sent the fax.',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/inbox/{{ $parameter.inboxId }}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many received faxes',
				description: 'Received faxes, newest first, metadata only',
				routing: {
					request: {
						method: 'GET',
						url: '/v1/inbox',
					},
					...itemsOutput,
				},
			},
		],
		default: 'getAll',
	},
];

export const inboxFields: INodeProperties[] = [
	{
		displayName: 'Inbox Item ID',
		name: 'inboxId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['inbox'],
				operation: ['get'],
			},
		},
		description: 'The received fax ID, inb_ followed by 32 hex characters',
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
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Archived', value: 'archived' },
					{ name: 'Read', value: 'read' },
					{ name: 'Received', value: 'received' },
				],
				default: 'received',
				routing: {
					send: {
						type: 'query',
						property: 'status',
					},
				},
			},
		],
	},
];
