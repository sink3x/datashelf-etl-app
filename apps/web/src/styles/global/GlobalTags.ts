import { createGlobalStyle } from 'styled-components'

import { EColorsMain } from '@styles/colors/colors-main'

export const GlobalStyleTags = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    overflow-x: hidden;
  }
  
  html {
    height: 100%;
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    font-family: 'Inter Variable', sans-serif;
    background-color: ${EColorsMain.WHITE_BACKGROUND};
    
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }

    &:hover::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.4);
    }

    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2);

    ::selection {
      color: ${EColorsMain.WHITE};
      background-color: ${EColorsMain.BLUE}
    }

    body {
      margin: 0;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;

      code {
        font-family: 'Fira Code Variable', monospace;
      }

      a,
      a:hover,
      a:active,
      a:focus {
        text-decoration: none;
        outline: none;
      }
    }
  }
`
