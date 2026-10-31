import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDocuments = {
	resource: ['document'],
};

const showOnlyForPrepare = {
	resource: ['document'],
	operation: ['prepare'],
};

export const documentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForDocuments,
		},
		options: [
			{
				name: 'Prepare',
				value: 'prepare',
				action: 'Prepare a document',
				description:
					'Create the document to fax from text, Markdown, HTML or a completed upload. Nothing is sent.',
				routing: {
					request: {
						method: 'POST',
						url: '/v1/documents',
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a document',
				description: 'Read a document by ID: page count, sha256 and validation state',
				routing: {
					request: {
						method: 'GET',
						url: '=/v1/documents/{{ $parameter.documentId }}',
					},
				},
			},
		],
		default: 'prepare',
	},
];

export const documentFields: INodeProperties[] = [
	{
		displayName: 'Source',
		name: 'source',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForPrepare,
		},
		options: [
			{
				name: 'Text',
				value: 'text',
				description: 'Plain text rendered to a letter PDF',
			},
			{
				name: 'Markdown',
				value: 'markdown',
				description: 'Markdown (headings, lists, emphasis, code) rendered to PDF',
			},
			{
				name: 'HTML',
				value: 'html',
				description: 'HTML rendered to PDF with scripts off and no network',
			},
			{
				name: 'Upload ID',
				value: 'upload_id',
				description: 'A completed upload (PDF, PNG, JPG or TIFF) made through the REST API',
			},
		],
		default: 'text',
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: {
			rows: 6,
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForPrepare,
				source: ['text'],
			},
		},
		description: 'The text of the fax',
		routing: {
			send: {
				type: 'body',
				property: 'text',
			},
		},
	},
	{
		displayName: 'Markdown',
		name: 'markdown',
		type: 'string',
		typeOptions: {
			rows: 6,
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForPrepare,
				source: ['markdown'],
			},
		},
		description: 'The Markdown of the fax',
		routing: {
			send: {
				type: 'body',
				property: 'markdown',
			},
		},
	},
	{
		displayName: 'HTML',
		name: 'html',
		type: 'string',
		typeOptions: {
			rows: 6,
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForPrepare,
				source: ['html'],
			},
		},
		description:
			'The HTML of the fax. Inline CSS and data: images print, external resources do not load.',
		routing: {
			send: {
				type: 'body',
				property: 'html',
			},
		},
	},
	{
		displayName: 'Upload ID',
		name: 'uploadId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForPrepare,
				source: ['upload_id'],
			},
		},
		description: 'The ID of a completed upload, upl_ followed by 32 hex characters',
		routing: {
			send: {
				type: 'body',
				property: 'upload_id',
			},
		},
	},
	{
		displayName: 'Filename',
		name: 'filename',
		type: 'string',
		default: '',
		displayOptions: {
			show: showOnlyForPrepare,
		},
		description: 'A name for the document, shown in the dashboard',
		routing: {
			send: {
				type: 'body',
				property: 'filename',
				value: '={{ $value || undefined }}',
			},
		},
	},
	{
		displayName: 'Document ID',
		name: 'documentId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['document'],
				operation: ['get'],
			},
		},
		description: 'The document ID, doc_ followed by 32 hex characters',
	},
];
