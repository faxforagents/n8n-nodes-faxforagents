import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FaxForAgentsApi implements ICredentialType {
	name = 'faxForAgentsApi';

	displayName = 'Fax for Agents API';

	icon: Icon = {
		light: 'file:../icons/faxforagents.svg',
		dark: 'file:../icons/faxforagents.dark.svg',
	};

	documentationUrl = 'https://faxforagents.com/docs/quickstart/';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'An ffa_test_ key reaches the sandbox only and costs nothing. An ffa_live_ key reaches the carrier and spends the prepaid wallet. Keys are created at app.faxforagents.com.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.faxforagents.com',
			url: '/v1/me',
			method: 'GET',
		},
	};
}
