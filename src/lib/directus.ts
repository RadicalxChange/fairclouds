const DIRECTUS_API_TOKEN = import.meta.env.DIRECTUS_API_TOKEN;

import { createDirectus, rest, staticToken } from '@directus/sdk';

const directus = createDirectus('https://directus--fairclouds-u18160.vm.elestio.app/').with(rest());

export const directusAdmin = createDirectus('https://directus--fairclouds-u18160.vm.elestio.app/').with(staticToken(DIRECTUS_API_TOKEN as string)).with(rest());

export default directus;