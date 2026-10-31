import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

import { documentOperations, documentFields } from './resources/document';
import { faxOperations, faxFields } from './resources/fax';
import { inboxOperations, inboxFields } from './resources/inbox';

export class FaxForAgents implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Fax for Agents',
		name: 'faxForAgents',
		icon: {
			light: 'file:../../icons/faxforagents.svg',
			dark: 'file:../../icons/faxforagents.dark.svg',
		},
		group: ['output'],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Send and receive faxes through the Fax for Agents API',
		defaults: {
			name: 'Fax for Agents',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'faxForAgentsApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.faxforagents.com',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Document',
						value: 'document',
					},
					{
						name: 'Fax',
						value: 'fax',
					},
					{
						name: 'Inbox',
						value: 'inbox',
					},
				],
				default: 'fax',
			},
			...documentOperations,
			...documentFields,
			...faxOperations,
			...faxFields,
			...inboxOperations,
			...inboxFields,
		],
	};
}
