const DIRECTUS_API_TOKEN = import.meta.env.DIRECTUS_API_TOKEN;

import { createDirectus, rest, staticToken, authentication} from '@directus/sdk';

const directus = createDirectus('https://cms.fairclouds.life').with(rest());

export const directusAuth = createDirectus('https://cms.fairclouds.life').with(authentication());

export const directusAdmin = createDirectus('https://cms.fairclouds.life').with(staticToken(DIRECTUS_API_TOKEN)).with(rest());

export default directus;