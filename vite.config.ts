import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react()],
	build: {
		lib: {
			entry: './src/index.tsx',
			name: 'material-swipeable-list',
			fileName: 'index',
		},
		rollupOptions: {
			external: ['react'],
			output: {
				globals: {
					react: 'React',
				},
			},
		},
	},
});
