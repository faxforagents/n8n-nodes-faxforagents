import type { INodeProperties } from 'n8n-workflow';

/**
 * Pages of the API carry `items` and `next_cursor`. These two properties give a Get Many
 * operation its Limit and Return All switches, and the pagination follows the cursor.
 */
export function pagedFields(show: Record<string, string[]>): INodeProperties[] {
	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			displayOptions: {
				show,
			},
			default: false,
			description: 'Whether to return all results or only up to a given limit',
			routing: {
				send: {
					paginate: '={{ $value }}',
					type: 'query',
					property: 'limit',
					value: '100',
				},
				operations: {
					pagination: {
						type: 'generic',
						properties: {
							continue: '={{ !!$response.body.next_cursor }}',
							request: {
								qs: {
									cursor: '={{ $response.body.next_cursor }}',
								},
							},
						},
					},
				},
			},
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			displayOptions: {
				show: {
					...show,
					returnAll: [false],
				},
			},
			typeOptions: {
				minValue: 1,
				maxValue: 100,
			},
			default: 50,
			routing: {
				send: {
					type: 'query',
					property: 'limit',
				},
				output: {
					maxResults: '={{ $value }}',
				},
			},
			description: 'Max number of results to return',
		},
	];
}

/** Splits a page into one item per element of `items`. */
export const itemsOutput = {
	output: {
		postReceive: [
			{
				type: 'rootProperty' as const,
				properties: {
					property: 'items',
				},
			},
		],
	},
};
