export interface IAppConfig {
  server: {
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
