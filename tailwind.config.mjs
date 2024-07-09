/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary: '#72AEE9',
				white: '#FFFFFF',
				grey: '#D9D9D9'
			},
			boxShadow: {
        'cloud': 'inset 0px 0px 6.8px 3px #FFFFFF',
				'large-cloud': 'inset 0px 0px 23.9px 5px #FFFFFF',
      },
			borderRadius: {
				default: '10px',
			}
		},
	},
	plugins: [],
}