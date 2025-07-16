import 'styled-components';

// You may need to adjust the import path if the theme is moved
import { theme } from './EmailVerification';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: typeof theme.colors;
    shadows: typeof theme.shadows;
    borderRadius: typeof theme.borderRadius;
  }
} 