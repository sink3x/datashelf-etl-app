export interface IAppConfig {
  server: {
    protocol: string
    host: string
    port: number
  }
  services: {
    airflow: {
      username: string
      password: string
      url: string
    }
  }
  vars: {}
}
