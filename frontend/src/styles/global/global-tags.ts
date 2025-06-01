import { createGlobalStyle } from 'styled-components'

export const GlobalStyleTags = createGlobalStyle`
  html {
    height: 100%;
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    font-family: 'Inter Variable', sans-serif;

    ::selection {
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
