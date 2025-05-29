```bash
docker build -t backend .
```

```bash
docker run -d -p 5000:5000 --name backend backend
```

## TODO

- [ ] YC IAM + Vault integration
- [ ] CI/CD
- [ ] [DI via package](https://inversify.io)
- [ ] logger service
- [ ] implement middlewares
