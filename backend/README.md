```bash
docker build -t backend .
```

```bash
docker run -d -p 5000:5000 --name backend backend
```

## TODO

- [ ] `/api/files` | GET | -> S3
- [ ] `/api/files/:fileName` | POST GET DELETE | -> S3
- [ ] `/api/airflow/dags/:dagId?run_id` | GET | -> airflow
- [ ] `/api/airflow/proccessed-data` | GET | -> mongodb or clickhouse
- [ ] `/api/airflow/proccessed-data/:datasetId` | GET | -> mongodb or clickhouse
- [ ] swagger favicon
- [ ] YC IAM + Vault integration
- [ ] CI/CD
- [ ] [DI via package](https://inversify.io)
- [ ] logger service
- [ ] implement middlewares
